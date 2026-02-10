import { ApiProperty } from '@nestjs/swagger';

export class Source {
  @ApiProperty({ example: '1', description: 'The unique identifier of the source' })
  id: string;

  @ApiProperty({ example: 'Aeon', description: 'The name of the publication' })
  name: string;

  @ApiProperty({ example: 'https://aeon.co', description: 'The base URL of the publication' })
  baseUrl: string;

  @ApiProperty({ example: 'rss', enum: ['rss', 'scraper'], description: ' The type of ingestion' })
  type: 'rss' | 'scraper';

  @ApiProperty({ example: 'https://aeon.co/feed.rss', description: 'The RSS feed URL (optional)', required: false })
  rssUrl?: string;
}
