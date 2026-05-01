import { ArticlesService } from './articles.service';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    triggerIngestion(): Promise<{
        message: string;
    }>;
    findAll(query: any): Promise<{
        data: import("./entities/article.entity").ArticleDocument[];
        total: number;
        limit: number;
        offset: number;
    }>;
    findOne(id: string): Promise<import("./entities/article.entity").ArticleDocument>;
}
