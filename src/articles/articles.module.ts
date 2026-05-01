import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article, ArticleSchema } from './entities/article.entity';
import { SyncState, SyncStateSchema } from './entities/sync-state.entity';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
      { name: SyncState.name, schema: SyncStateSchema }
    ]),
    SourcesModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
