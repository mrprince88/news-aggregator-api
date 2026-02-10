import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Article } from './entities/article.entity';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated articles' })
  @ApiQuery({ name: 'source', required: false, description: 'Filter by source ID' })
  @ApiQuery({ name: 'topic', required: false, description: 'Filter by topic' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'offset', required: false, description: 'Pagination offset', example: 0 })
  @ApiQuery({ name: 'from', required: false, description: 'Date from (ISO string)' })
  @ApiQuery({ name: 'to', required: false, description: 'Date to (ISO string)' })
  @ApiResponse({ status: 200, description: 'Return paginated articles.' })
  findAll(@Query() query: any) {
    return this.articlesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an article by ID' })
  @ApiResponse({ status: 200, description: 'Return the article.', type: Article })
  @ApiResponse({ status: 404, description: 'Article not found.' })
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }
}
