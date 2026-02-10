import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    findAll(query: any): {
        data: Article[];
        total: number;
        limit: number;
        offset: number;
    };
    findOne(id: string): Article;
}
