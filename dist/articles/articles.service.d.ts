import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { ArticleDocument } from './entities/article.entity';
import { SourcesService } from '../sources/sources.service';
export declare class ArticlesService implements OnModuleInit {
    private readonly articleModel;
    private readonly sourcesService;
    private readonly logger;
    constructor(articleModel: Model<ArticleDocument>, sourcesService: SourcesService);
    onModuleInit(): Promise<void>;
    handleCron(): Promise<void>;
    ingestAll(): Promise<void>;
    private ingestRSS;
    private parseRSSXml;
    private ingestRSSViaProxy;
    private ingestHTML;
    private fetchHtml;
    private parseEPW;
    private parseFiftyTwo;
    private parseFoundingFuel;
    private extractXmlTag;
    private stripHtml;
    private decodeHtmlEntities;
    private determineTopic;
    private generateMetadataWithLLM;
    findAll(query: {
        source?: string;
        topic?: string;
        limit?: string;
        offset?: string;
        from?: string;
        to?: string;
    }): Promise<{
        data: ArticleDocument[];
        total: number;
        limit: number;
        offset: number;
    }>;
    findOne(id: string): Promise<ArticleDocument>;
}
