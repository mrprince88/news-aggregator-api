import { ApiProperty } from '@nestjs/swagger';

export class Article {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The unique identifier of the article' })
  id: string;

  @ApiProperty({ example: 'source-1', description: 'The ID of the source' })
  sourceId: string;

  @ApiProperty({ example: 'The Future of AI', description: 'The title of the article' })
  title: string;

  @ApiProperty({ example: 'https://example.com/article', description: 'The canonical URL of the article' })
  canonicalUrl: string;

  @ApiProperty({ example: 'A summary of the article...', description: 'Brief summary', required: false })
  summary?: string;

  @ApiProperty({ description: 'The publication date' })
  publishedAt: Date;

  @ApiProperty({ example: 'John Doe', description: 'The author name', required: false })
  authorName?: string;

  @ApiProperty({ example: 'Technology', description: 'The topic/category', required: false })
  topic?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Article thumbnail URL', required: false })
  imageUrl?: string;

  @ApiProperty({ example: false, description: 'Whether the article is paywalled', required: false })
  isPaywalled?: boolean = false;
}
