import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSourceDto {
  @ApiProperty({ example: 'Aeon', description: 'Name of the source' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://aeon.co', description: 'Base URL of the source' })
  @IsUrl()
  baseUrl: string;

  @ApiProperty({ example: 'rss', enum: ['rss', 'scraper'], description: 'Type of ingestion' })
  @IsEnum(['rss', 'scraper'])
  type: 'rss' | 'scraper';

  @ApiProperty({ example: 'https://aeon.co/feed.rss', description: 'RSS URL (optional)', required: false })
  @IsOptional()
  @IsUrl()
  rssUrl?: string;
}
