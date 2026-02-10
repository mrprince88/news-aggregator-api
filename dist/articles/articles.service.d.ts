import { OnModuleInit } from '@nestjs/common';
import { Article } from './entities/article.entity';
import { SourcesService } from '../sources/sources.service';
export declare class ArticlesService implements OnModuleInit {
    private readonly sourcesService;
    private articles;
    private readonly logger;
    constructor(sourcesService: SourcesService);
    onModuleInit(): Promise<void>;
    ingestAll(): Promise<void>;
    private ingestRSS;
    private parseRSSXml;
    private ingestRSSViaProxy;
    private ingestHTML;
    private fetchHtml;
    private parseEPW;
    private parseFiftyTwo;
    private extractXmlTag;
    private stripHtml;
    private decodeHtmlEntities;
    findAll(query: {
        source?: string;
        topic?: string;
        limit?: string;
        offset?: string;
        from?: string;
        to?: string;
    }): {
        data: Article[];
        total: number;
        limit: number;
        offset: number;
    };
    findOne(id: string): Article;
}
