import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { CreateSourceDto } from './dto/create-source.dto';
import { Source } from './entities/source.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class SourcesService implements OnModuleInit {
  private sources: Source[] = [];
  private readonly logger = new Logger(SourcesService.name);

  onModuleInit() {
    this.seedInitialSources();
  }

  private seedInitialSources() {
    if (this.sources.length > 0) return;

    const initialSources: Omit<Source, 'id'>[] = [
      {
        name: 'Aeon',
        baseUrl: 'https://aeon.co',
        type: 'rss',
        rssUrl: 'https://aeon.co/feed.rss',
      },
      {
        name: 'Project Syndicate',
        baseUrl: 'https://www.project-syndicate.org',
        type: 'rss',
        rssUrl: 'https://www.project-syndicate.org/rss',
      },
      {
        name: 'The Atlantic',
        baseUrl: 'https://www.theatlantic.com',
        type: 'rss',
        rssUrl: 'https://www.theatlantic.com/feed/all/',
      },
      {
        name: 'EPW',
        baseUrl: 'https://www.epw.in',
        type: 'scraper',
      },
      {
        name: 'The Point',
        baseUrl: 'https://thepointmag.com',
        type: 'rss',
        rssUrl: 'https://thepointmag.com/feed/',
      },
      {
        name: 'FiftyTwo',
        baseUrl: 'https://fiftytwo.in',
        type: 'scraper',
      },
      {
        name: 'Founding Fuel',
        baseUrl: 'https://foundingfuel.com',
        type: 'rss',
        rssUrl: 'http://www.foundingfuel.com/rss/latest',
      },
    ];

    initialSources.forEach((source) => {
      this.create(source as CreateSourceDto);
    });
    this.logger.log(`Seeded ${this.sources.length} sources.`);
  }

  create(createSourceDto: CreateSourceDto): Source {
    const newSource: Source = {
      id: randomUUID(),
      ...createSourceDto,
    };
    this.sources.push(newSource);
    return newSource;
  }

  findAll(): Source[] {
    return this.sources;
  }

  findOne(id: string): Source {
    const source = this.sources.find((s) => s.id === id);
    if (!source) {
      throw new NotFoundException(`Source with ID ${id} not found`);
    }
    return source;
  }
}
