import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'articles' })
export class Article {
  @ApiProperty({ description: 'The unique identifier of the article' })
  _id: string;

  @ApiProperty({ example: 'source-1', description: 'The ID of the source' })
  @Prop({ required: true, index: true })
  sourceId: string;

  @ApiProperty({ example: 'The Future of AI', description: 'The title of the article' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 'https://example.com/article', description: 'The canonical URL of the article' })
  @Prop({ required: true, unique: true, index: true })
  canonicalUrl: string;

  @ApiProperty({ example: 'A summary of the article...', description: 'Brief summary', required: false })
  @Prop()
  summary?: string;

  @ApiProperty({ description: 'The publication date' })
  @Prop({ required: true, index: true })
  publishedAt: Date;

  @ApiProperty({ example: 'John Doe', description: 'The author name', required: false })
  @Prop()
  authorName?: string;

  @ApiProperty({ example: 'Technology', description: 'The topic/category', required: false })
  @Prop({ index: true })
  topic?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Article thumbnail URL', required: false })
  @Prop()
  imageUrl?: string;

  @ApiProperty({ example: false, description: 'Whether the article is paywalled', required: false })
  @Prop({ default: false })
  isPaywalled?: boolean;
}

export type ArticleDocument = Article & Document;
export const ArticleSchema = SchemaFactory.createForClass(Article);
