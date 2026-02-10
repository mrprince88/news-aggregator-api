import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { Article } from './entities/article.entity';
import { SourcesService } from '../sources/sources.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ArticlesService implements OnModuleInit {
  private articles: Article[] = [];
  private readonly logger = new Logger(ArticlesService.name);

  constructor(private readonly sourcesService: SourcesService) {}

  async onModuleInit() {
    await this.ingestAll();
    // Schedule periodic ingestion every 15 minutes
    setInterval(() => this.ingestAll(), 15 * 60 * 1000);
  }

  async ingestAll() {
    this.logger.log('Starting ingestion...');
    const sources = this.sourcesService.findAll();
    for (const source of sources) {
      if (source.type === 'rss' && source.rssUrl) {
        await this.ingestRSS(source);
      } else if (source.type === 'scraper') {
        await this.ingestHTML(source);
      }
    }
    this.logger.log(`Ingestion complete. Total articles: ${this.articles.length}`);
  }

  /**
   * Fetch and parse RSS feed for a given source.
   * Uses native fetch + simple XML regex parsing.
   */
  private async ingestRSS(source: { id: string; name: string; rssUrl?: string }) {
    if (!source.rssUrl) return;
    try {
      this.logger.log(`Fetching RSS for ${source.name}: ${source.rssUrl}`);
      const response = await fetch(source.rssUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      if (!response.ok) {
        this.logger.warn(`RSS fetch failed for ${source.name}: HTTP ${response.status}, trying proxy...`);
        await this.ingestRSSViaProxy(source);
        return;
      }
      const xml = await response.text();

      // Check if response is actually XML (not a Cloudflare challenge page)
      if (!xml.includes('<item>') && !xml.includes('<entry>')) {
        this.logger.warn(`RSS response for ${source.name} is not valid XML (possibly Cloudflare), trying proxy...`);
        await this.ingestRSSViaProxy(source);
        return;
      }

      this.parseRSSXml(xml, source.id);
    } catch (error: any) {
      this.logger.error(`Failed to ingest RSS for ${source.name}: ${error.message}, trying proxy...`);
      try {
        await this.ingestRSSViaProxy(source);
      } catch (proxyError: any) {
        this.logger.error(`Proxy fallback also failed for ${source.name}: ${proxyError.message}`);
      }
    }
  }

  private parseRSSXml(xml: string, sourceId: string) {
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = this.extractXmlTag(itemXml, 'title');
      const link = this.extractXmlTag(itemXml, 'link');
      const description = this.extractXmlTag(itemXml, 'description');
      const pubDate = this.extractXmlTag(itemXml, 'pubDate');
      const creator = this.extractXmlTag(itemXml, 'dc:creator') || this.extractXmlTag(itemXml, 'author');

      if (title && link) {
        const exists = this.articles.some((a) => a.canonicalUrl === link);
        if (!exists) {
          this.articles.push({
            id: randomUUID(),
            sourceId,
            title: this.decodeHtmlEntities(title),
            canonicalUrl: link,
            summary: description ? this.decodeHtmlEntities(this.stripHtml(description)) : undefined,
            publishedAt: pubDate ? new Date(pubDate) : new Date(),
            authorName: creator ? this.decodeHtmlEntities(creator) : undefined,
            isPaywalled: false,
          });
        }
      }
    }
  }

  /**
   * Fallback: fetch RSS via rss2json.com proxy for Cloudflare-protected feeds.
   */
  private async ingestRSSViaProxy(source: { id: string; name: string; rssUrl?: string }) {
    if (!source.rssUrl) return;
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rssUrl)}`;
    this.logger.log(`Using rss2json proxy for ${source.name}`);

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      this.logger.warn(`Proxy fetch failed for ${source.name}: HTTP ${response.status}`);
      return;
    }

    const data = await response.json() as {
      status: string;
      items?: Array<{
        title: string;
        link: string;
        description?: string;
        pubDate?: string;
        author?: string;
      }>;
    };

    if (data.status !== 'ok' || !data.items) {
      this.logger.warn(`Proxy returned bad status for ${source.name}: ${data.status}`);
      return;
    }

    for (const item of data.items) {
      if (!item.title || !item.link) continue;
      const exists = this.articles.some((a) => a.canonicalUrl === item.link);
      if (!exists) {
        this.articles.push({
          id: randomUUID(),
          sourceId: source.id,
          title: this.decodeHtmlEntities(this.stripHtml(item.title)),
          canonicalUrl: item.link,
          summary: item.description ? this.decodeHtmlEntities(this.stripHtml(item.description)) : undefined,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          authorName: item.author || undefined,
          isPaywalled: false,
        });
      }
    }
    this.logger.log(`Proxy ingestion for ${source.name}: added ${data.items.length} items`);
  }


  /**
   * Placeholder for HTML/scraping ingestion.
   * TODO: Implement actual HTML parsing (e.g. with cheerio) for sources that don't have RSS.
   */
  private async ingestHTML(source: { id: string; name: string; baseUrl: string }) {
    try {
      this.logger.log(`Scraping ${source.name}: ${source.baseUrl}`);
      const html = await this.fetchHtml(source.baseUrl);

      let items: { title: string; link: string }[] = [];
      if (source.name === 'EPW') {
        items = this.parseEPW(html, source.baseUrl);
      } else if (source.name === 'FiftyTwo') {
        items = this.parseFiftyTwo(html, source.baseUrl);
      }

      for (const item of items) {
        if (!item.title || !item.link) continue;
        
        const exists = this.articles.some((a) => a.canonicalUrl === item.link);
        if (!exists) {
          this.articles.push({
            id: randomUUID(),
            sourceId: source.id,
            title: this.decodeHtmlEntities(item.title),
            canonicalUrl: item.link,
            publishedAt: new Date(),
            isPaywalled: false,
          });
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to scrape ${source.name}: ${error.message}`);
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.text();
  }

  private parseEPW(html: string, baseUrl: string): { title: string; link: string }[] {
    const items: { title: string; link: string }[] = [];
    const seen = new Set<string>();

    // Target article title links within EPW's Drupal view structure
    // Pattern: <div class="views-field views-field-title"><a href="/journal/...html">Title</a></div>
    const titleDivRegex = /views-field-title[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = titleDivRegex.exec(html)) !== null) {
      const href = match[1];
      const text = this.stripHtml(match[2]).trim();
      if (href.includes('/journal/') && href.endsWith('.html') && text.length > 5) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          items.push({ title: text, link: fullUrl });
        }
      }
    }

    // Fallback: also grab any remaining /journal/ links not yet captured
    const fallbackRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]{10,})<\/a>/gi;
    while ((match = fallbackRegex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].trim();
      if (href.includes('/journal/') && href.endsWith('.html')) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          items.push({ title: this.decodeHtmlEntities(text), link: fullUrl });
        }
      }
    }

    return items;
  }

  private parseFiftyTwo(html: string, baseUrl: string): { title: string; link: string }[] {
    const items: { title: string; link: string }[] = [];
    const seen = new Set<string>();

    // Strategy 1: Extract titles from <a> tags containing <h1>, <h3>, or <div class="story-...title">
    // Pattern: <a href="/story/slug/" ...><div class="story-one__title"><h1>Title</h1></div></a>
    const storyBlockRegex = /<a[^>]+href=["'](\/story\/[^"']+)["'][^>]*>[\s\S]*?<(?:h1|h2|h3)[^>]*>([\s\S]*?)<\/(?:h1|h2|h3)>[\s\S]*?<\/a>/gi;
    let match;
    while ((match = storyBlockRegex.exec(html)) !== null) {
      const href = match[1];
      const text = this.stripHtml(match[2]).trim();
      if (text.length > 2) {
        const fullUrl = new URL(href, baseUrl).toString();
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          items.push({ title: this.decodeHtmlEntities(text), link: fullUrl });
        }
      }
    }

    // Strategy 2: Fallback — extract from simple <a> tags with /story/ href and clean text
    const simpleLinkRegex = /<a[^>]+href=["'](\/story\/[^"']+)["'][^>]*>([^<]{3,})<\/a>/gi;
    while ((match = simpleLinkRegex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].trim();
      if (text.length > 2) {
        const fullUrl = new URL(href, baseUrl).toString();
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          items.push({ title: this.decodeHtmlEntities(text), link: fullUrl });
        }
      }
    }

    return items;
  }

  private extractXmlTag(xml: string, tag: string): string | null {
    // Handle CDATA sections
    const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
    const cdataMatch = cdataRegex.exec(xml);
    if (cdataMatch) return cdataMatch[1].trim();

    // Handle regular tags
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
    const match = regex.exec(xml);
    return match ? match[1].trim() : null;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private decodeHtmlEntities(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
  }

  findAll(query: {
    source?: string;
    topic?: string;
    limit?: string;
    offset?: string;
    from?: string;
    to?: string;
  }): { data: Article[]; total: number; limit: number; offset: number } {
    let results = [...this.articles];

    if (query.source) {
      results = results.filter((a) => a.sourceId === query.source);
    }
    if (query.topic) {
      results = results.filter((a) =>
        a.topic?.toLowerCase().includes(query.topic!.toLowerCase()),
      );
    }
    if (query.from) {
      results = results.filter(
        (a) => new Date(a.publishedAt) >= new Date(query.from!),
      );
    }
    if (query.to) {
      results = results.filter(
        (a) => new Date(a.publishedAt) <= new Date(query.to!),
      );
    }

    // Sort by date descending
    results.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    const total = results.length;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;
    const data = results.slice(offset, offset + limit);

    return { data, total, limit, offset };
  }

  findOne(id: string): Article {
    const article = this.articles.find((a) => a.id === id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }
}
