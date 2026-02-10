"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ArticlesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const sources_service_1 = require("../sources/sources.service");
const crypto_1 = require("crypto");
let ArticlesService = ArticlesService_1 = class ArticlesService {
    constructor(sourcesService) {
        this.sourcesService = sourcesService;
        this.articles = [];
        this.logger = new common_1.Logger(ArticlesService_1.name);
    }
    async onModuleInit() {
        await this.ingestAll();
        setInterval(() => this.ingestAll(), 15 * 60 * 1000);
    }
    async ingestAll() {
        this.logger.log('Starting ingestion...');
        const sources = this.sourcesService.findAll();
        for (const source of sources) {
            if (source.type === 'rss' && source.rssUrl) {
                await this.ingestRSS(source);
            }
            else if (source.type === 'scraper') {
                await this.ingestHTML(source);
            }
        }
        this.logger.log(`Ingestion complete. Total articles: ${this.articles.length}`);
    }
    async ingestRSS(source) {
        if (!source.rssUrl)
            return;
        try {
            this.logger.log(`Fetching RSS for ${source.name}: ${source.rssUrl}`);
            const response = await fetch(source.rssUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            });
            if (!response.ok) {
                this.logger.warn(`RSS fetch failed for ${source.name}: HTTP ${response.status}, trying proxy...`);
                await this.ingestRSSViaProxy(source);
                return;
            }
            const xml = await response.text();
            if (!xml.includes('<item>') && !xml.includes('<entry>')) {
                this.logger.warn(`RSS response for ${source.name} is not valid XML (possibly Cloudflare), trying proxy...`);
                await this.ingestRSSViaProxy(source);
                return;
            }
            this.parseRSSXml(xml, source.id);
        }
        catch (error) {
            this.logger.error(`Failed to ingest RSS for ${source.name}: ${error.message}, trying proxy...`);
            try {
                await this.ingestRSSViaProxy(source);
            }
            catch (proxyError) {
                this.logger.error(`Proxy fallback also failed for ${source.name}: ${proxyError.message}`);
            }
        }
    }
    parseRSSXml(xml, sourceId) {
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
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
                        id: (0, crypto_1.randomUUID)(),
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
    async ingestRSSViaProxy(source) {
        if (!source.rssUrl)
            return;
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rssUrl)}`;
        this.logger.log(`Using rss2json proxy for ${source.name}`);
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            this.logger.warn(`Proxy fetch failed for ${source.name}: HTTP ${response.status}`);
            return;
        }
        const data = await response.json();
        if (data.status !== 'ok' || !data.items) {
            this.logger.warn(`Proxy returned bad status for ${source.name}: ${data.status}`);
            return;
        }
        for (const item of data.items) {
            if (!item.title || !item.link)
                continue;
            const exists = this.articles.some((a) => a.canonicalUrl === item.link);
            if (!exists) {
                this.articles.push({
                    id: (0, crypto_1.randomUUID)(),
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
    async ingestHTML(source) {
        try {
            this.logger.log(`Scraping ${source.name}: ${source.baseUrl}`);
            const html = await this.fetchHtml(source.baseUrl);
            let items = [];
            if (source.name === 'EPW') {
                items = this.parseEPW(html, source.baseUrl);
            }
            else if (source.name === 'FiftyTwo') {
                items = this.parseFiftyTwo(html, source.baseUrl);
            }
            for (const item of items) {
                if (!item.title || !item.link)
                    continue;
                const exists = this.articles.some((a) => a.canonicalUrl === item.link);
                if (!exists) {
                    this.articles.push({
                        id: (0, crypto_1.randomUUID)(),
                        sourceId: source.id,
                        title: this.decodeHtmlEntities(item.title),
                        canonicalUrl: item.link,
                        publishedAt: new Date(),
                        isPaywalled: false,
                    });
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to scrape ${source.name}: ${error.message}`);
        }
    }
    async fetchHtml(url) {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.text();
    }
    parseEPW(html, baseUrl) {
        const items = [];
        const seen = new Set();
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
    parseFiftyTwo(html, baseUrl) {
        const items = [];
        const seen = new Set();
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
    extractXmlTag(xml, tag) {
        const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
        const cdataMatch = cdataRegex.exec(xml);
        if (cdataMatch)
            return cdataMatch[1].trim();
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
        const match = regex.exec(xml);
        return match ? match[1].trim() : null;
    }
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').trim();
    }
    decodeHtmlEntities(text) {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/');
    }
    findAll(query) {
        let results = [...this.articles];
        if (query.source) {
            results = results.filter((a) => a.sourceId === query.source);
        }
        if (query.topic) {
            results = results.filter((a) => a.topic?.toLowerCase().includes(query.topic.toLowerCase()));
        }
        if (query.from) {
            results = results.filter((a) => new Date(a.publishedAt) >= new Date(query.from));
        }
        if (query.to) {
            results = results.filter((a) => new Date(a.publishedAt) <= new Date(query.to));
        }
        results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        const total = results.length;
        const limit = query.limit ? parseInt(query.limit, 10) : 20;
        const offset = query.offset ? parseInt(query.offset, 10) : 0;
        const data = results.slice(offset, offset + limit);
        return { data, total, limit, offset };
    }
    findOne(id) {
        const article = this.articles.find((a) => a.id === id);
        if (!article) {
            throw new common_1.NotFoundException(`Article with ID ${id} not found`);
        }
        return article;
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = ArticlesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sources_service_1.SourcesService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map