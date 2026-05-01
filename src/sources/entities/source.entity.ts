import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'sources' })
export class Source {
  @ApiProperty({ description: 'The unique identifier of the source' })
  _id: string;

  @ApiProperty({ example: 'Aeon', description: 'The name of the publication' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ example: 'https://aeon.co', description: 'The base URL of the publication' })
  @Prop({ required: true })
  baseUrl: string;

  @ApiProperty({ example: 'rss', enum: ['rss', 'scraper'], description: 'The type of ingestion' })
  @Prop({ required: true, enum: ['rss', 'scraper'] })
  type: 'rss' | 'scraper';

  @ApiProperty({ example: 'https://aeon.co/feed.rss', description: 'The RSS feed URL (optional)', required: false })
  @Prop()
  rssUrl?: string;
}

export type SourceDocument = Source & Document;
export const SourceSchema = SchemaFactory.createForClass(Source);
