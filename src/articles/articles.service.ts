import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Article, ArticleDocument } from './entities/article.entity';
import { SourcesService } from '../sources/sources.service';

@Injectable()
export class ArticlesService implements OnModuleInit {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>,
    private readonly sourcesService: SourcesService,
  ) {}

  async onModuleInit() {
    this.ingestAll().catch(e => this.logger.error('Ingestion failed:', e));
  }

  /**
   * Refetch articles every 30 minutes.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    this.logger.log('Scheduled ingestion triggered (every 30 min)');
    await this.ingestAll();
  }

  async ingestAll() {
    this.logger.log('Starting ingestion...');
    const sources = await this.sourcesService.findAll();
    for (const source of sources) {
      if (source.type === 'rss' && source.rssUrl) {
        await this.ingestRSS(source);
      } else if (source.type === 'scraper') {
        await this.ingestHTML(source);
      }
    }
    const total = await this.articleModel.countDocuments();
    this.logger.log(`Ingestion complete. Total articles in DB: ${total}`);
  }

  /**
   * Fetch and parse RSS feed for a given source.
   * Uses native fetch + simple XML regex parsing.
   */
  private async ingestRSS(source: { _id: string; name: string; rssUrl?: string }) {
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

      await this.parseRSSXml(xml, source._id.toString());
    } catch (error: any) {
      this.logger.error(`Failed to ingest RSS for ${source.name}: ${error.message}, trying proxy...`);
      try {
        await this.ingestRSSViaProxy(source);
      } catch (proxyError: any) {
        this.logger.error(`Proxy fallback also failed for ${source.name}: ${proxyError.message}`);
      }
    }
  }

  private async parseRSSXml(xml: string, sourceId: string) {
    let itemRegex = /<item>([\s\S]*?)<\/item>/g;
    if (!xml.includes('<item>')) {
      itemRegex = /<entry>([\s\S]*?)<\/entry>/g;
    }

    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = this.extractXmlTag(itemXml, 'title');
      
      let link = this.extractXmlTag(itemXml, 'link');
      if (!link || link.trim() === '') {
        const linkMatch = /<link[^>]*href=["']([^"']+)["'][^>]*>/i.exec(itemXml);
        if (linkMatch) link = linkMatch[1];
      }

      const description = this.extractXmlTag(itemXml, 'description') || this.extractXmlTag(itemXml, 'summary') || this.extractXmlTag(itemXml, 'content');
      const pubDate = this.extractXmlTag(itemXml, 'pubDate') || this.extractXmlTag(itemXml, 'updated') || this.extractXmlTag(itemXml, 'published');
      let creator = this.extractXmlTag(itemXml, 'dc:creator') || this.extractXmlTag(itemXml, 'author');
      
      if (creator) {
         creator = this.stripHtml(creator);
      }

      const categoryRegex = /<category[^>]*>([\s\S]*?)<\/category>/gi;
      const categories: string[] = [];
      let catMatch;
      while ((catMatch = categoryRegex.exec(itemXml)) !== null) {
          categories.push(this.decodeHtmlEntities(this.stripHtml(catMatch[1])));
      }

      if (title && link) {
        // Skip existing articles to avoid unnecessary LLM calls
        const exists = await this.articleModel.exists({ canonicalUrl: link });
        if (exists) continue;

        const decodedTitle = this.decodeHtmlEntities(title);
        const decodedSummary = description ? this.decodeHtmlEntities(this.stripHtml(description)) : undefined;
        let topic = this.determineTopic(decodedTitle, decodedSummary, categories);
        let finalSummary = decodedSummary;

        const llmMetadata = await this.generateMetadataWithLLM(decodedTitle, decodedSummary);
        if (llmMetadata.topic) topic = llmMetadata.topic;
        if (llmMetadata.description) finalSummary = llmMetadata.description;

        await this.articleModel.updateOne(
          { canonicalUrl: link },
          {
            $setOnInsert: {
              sourceId,
              title: decodedTitle,
              canonicalUrl: link,
              summary: finalSummary,
              publishedAt: pubDate ? new Date(pubDate) : new Date(),
              authorName: creator ? this.decodeHtmlEntities(creator) : undefined,
              topic,
              isPaywalled: false,
            },
          },
          { upsert: true },
        );
      }
    }
  }

  /**
   * Fallback: fetch RSS via rss2json.com proxy for Cloudflare-protected feeds.
   */
  private async ingestRSSViaProxy(source: { _id: string; name: string; rssUrl?: string }) {
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
      
      const exists = await this.articleModel.exists({ canonicalUrl: item.link });
      if (exists) continue;

      const decodedTitle = this.decodeHtmlEntities(this.stripHtml(item.title));
      const decodedSummary = item.description ? this.decodeHtmlEntities(this.stripHtml(item.description)) : undefined;
      let topic = this.determineTopic(decodedTitle, decodedSummary);
      let finalSummary = decodedSummary;

      const llmMetadata = await this.generateMetadataWithLLM(decodedTitle, decodedSummary);
      if (llmMetadata.topic) topic = llmMetadata.topic;
      if (llmMetadata.description) finalSummary = llmMetadata.description;

      await this.articleModel.updateOne(
        { canonicalUrl: item.link },
        {
          $setOnInsert: {
            sourceId: source._id.toString(),
            title: decodedTitle,
            canonicalUrl: item.link,
            summary: finalSummary,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            authorName: item.author || undefined,
            topic,
            isPaywalled: false,
          },
        },
        { upsert: true },
      );
    }
    this.logger.log(`Proxy ingestion for ${source.name}: processed ${data.items.length} items`);
  }


  /**
   * HTML/scraping ingestion for sources that don't have RSS.
   */
  private async ingestHTML(source: { _id: string; name: string; baseUrl: string }) {
    try {
      this.logger.log(`Scraping ${source.name}: ${source.baseUrl}`);
      const html = await this.fetchHtml(source.baseUrl);

      let items: { title: string; link: string }[] = [];
      if (source.name === 'EPW') {
        items = this.parseEPW(html, source.baseUrl);
      } else if (source.name === 'FiftyTwo') {
        items = this.parseFiftyTwo(html, source.baseUrl);
      } else if (source.name === 'Founding Fuel') {
        items = this.parseFoundingFuel(html, source.baseUrl);
      }

      for (const item of items) {
        if (!item.title || !item.link) continue;
        
        const exists = await this.articleModel.exists({ canonicalUrl: item.link });
        if (exists) continue;

        const decodedTitle = this.decodeHtmlEntities(item.title);
        let topic = this.determineTopic(decodedTitle);
        let finalSummary = undefined;

        const llmMetadata = await this.generateMetadataWithLLM(decodedTitle);
        if (llmMetadata.topic) topic = llmMetadata.topic;
        if (llmMetadata.description) finalSummary = llmMetadata.description;

        await this.articleModel.updateOne(
          { canonicalUrl: item.link },
          {
            $setOnInsert: {
              sourceId: source._id.toString(),
              title: decodedTitle,
              canonicalUrl: item.link,
              summary: finalSummary,
              publishedAt: new Date(),
              topic,
              isPaywalled: false,
            },
          },
          { upsert: true },
        );
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

  private parseFoundingFuel(html: string, baseUrl: string): { title: string; link: string }[] {
    const items: { title: string; link: string }[] = [];
    const seen = new Set<string>();

    const linkRegex = /<a[^>]+href=["'](\/article\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const text = this.stripHtml(match[2]).trim();
      if (text.length > 5) {
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

  private determineTopic(title: string, summary?: string, categories?: string[]): string | undefined {
    const text = `${title} ${summary || ''} ${(categories || []).join(' ')}`.toLowerCase();
    
    const keywords = {
      Politics: ['politics', 'government', 'election', 'policy', 'democrat', 'republican', 'parliament', 'minister', 'president', 'congress', 'senate', 'legislation', 'supreme court', 'court', 'biden', 'trump', 'modi', 'lawmaker', 'vote'],
      Philosophy: ['philosophy', 'ethics', 'moral', 'existential', 'epistemology', 'metaphysics', 'nietzsche', 'plato', 'socrates', 'kant', 'mind'],
      Economics: ['economics', 'economy', 'market', 'finance', 'inflation', 'gdp', 'recession', 'interest rate', 'stock', 'business', 'trade', 'investment', 'bank', 'wealth'],
      Culture: ['culture', 'art', 'music', 'movie', 'film', 'literature', 'book', 'fashion', 'entertainment', 'celebrity', 'history', 'festival'],
      Technology: ['technology', 'tech', 'software', 'hardware', 'ai', 'artificial intelligence', 'apple', 'google', 'microsoft', 'cybersecurity', 'internet', 'startup', 'digital', 'app', 'computer'],
      Science: ['science', 'research', 'study', 'physics', 'biology', 'chemistry', 'space', 'nasa', 'astronomy', 'quantum', 'scientist', 'discovery', 'evolution'],
      Society: ['society', 'social', 'education', 'healthcare', 'health', 'community', 'inequality', 'welfare', 'population', 'gender', 'crime', 'justice'],
      Environment: ['environment', 'climate', 'sustainability', 'pollution', 'warming', 'green', 'renewable', 'carbon', 'energy', 'emissions', 'fossil fuel', 'nature', 'conservation']
    };

    let bestTopic = undefined;
    let maxMatches = 0;

    for (const [topic, words] of Object.entries(keywords)) {
      let matches = 0;
      for (const word of words) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(text)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestTopic = topic;
      }
    }

    return bestTopic;
  }

  private async generateMetadataWithLLM(title: string, summary?: string): Promise<{topic?: string, description?: string}> {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) return {};
    
    const baseUrl = process.env.BASE_URL || 'https://integrate.api.nvidia.com/v1';
    const modelName = process.env.MODEL_NAME || 'stepfun-ai/step-3.5-flash';

    const prompt = `Analyze the following article.\nTitle: '${title}'\nSummary: '${summary || ''}'\n\nPlease provide the most suitable topic from this exact list: [Politics, Philosophy, Economics, Culture, Technology, Science, Society, Environment].\nIf none perfectly fit, pick the closest one.\nAlso, write a concise 2-line description of the article.\n\nReturn your answer ONLY as raw valid JSON in this exact format, with no markdown formatting:\n{"topic": "<topic>", "description": "<2 line description>"}`;

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: "You are a news categorizer. You return only raw valid JSON without markdown formatting. Do not wrap in ```json" },
            { role: "user", content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) return {};

      const data = await response.json();
      let content = data.choices[0]?.message?.content?.trim();
      if (!content) return {};
      
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }
      
      return JSON.parse(content);
    } catch (err) {
      this.logger.error(`LLM metadata generation failed: ${err.message}`);
      return {};
    }
  }

  async findAll(query: {
    source?: string;
    topic?: string;
    limit?: string;
    offset?: string;
    from?: string;
    to?: string;
  }): Promise<{ data: ArticleDocument[]; total: number; limit: number; offset: number }> {
    const filter: Record<string, any> = {};

    if (query.source) {
      filter.sourceId = query.source;
    }
    if (query.topic) {
      filter.topic = { $regex: query.topic, $options: 'i' };
    }
    if (query.from || query.to) {
      filter.publishedAt = {};
      if (query.from) filter.publishedAt.$gte = new Date(query.from);
      if (query.to) filter.publishedAt.$lte = new Date(query.to);
    }

    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    const [data, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ publishedAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments(filter).exec(),
    ]);

    return { data, total, limit, offset };
  }

  async findOne(id: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }
}
