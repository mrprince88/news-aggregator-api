import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { SourcesModule } from './sources/sources.module';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [HealthModule, SourcesModule, ArticlesModule],
})
export class AppModule {}
