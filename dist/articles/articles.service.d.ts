import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { ArticleDocument } from './entities/article.entity';
import { SyncStateDocument } from './entities/sync-state.entity';
import { SourcesService } from '../sources/sources.service';
export declare class ArticlesService implements OnModuleInit {
    private readonly articleModel;
    private readonly syncStateModel;
    private readonly sourcesService;
    private readonly logger;
    constructor(articleModel: Model<ArticleDocument>, syncStateModel: Model<SyncStateDocument>, sourcesService: SourcesService);
    onModuleInit(): Promise<void>;
    handleCron(): Promise<void>;
    checkAndIngest(force?: boolean): Promise<void>;
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
