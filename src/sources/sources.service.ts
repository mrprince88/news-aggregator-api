import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSourceDto } from './dto/create-source.dto';
import { Source, SourceDocument } from './entities/source.entity';

@Injectable()
export class SourcesService implements OnModuleInit {
  private readonly logger = new Logger(SourcesService.name);

  constructor(
    @InjectModel(Source.name) private readonly sourceModel: Model<SourceDocument>,
  ) {}

  async onModuleInit() {
    await this.seedInitialSources();
  }

  private async seedInitialSources() {
    const count = await this.sourceModel.countDocuments();
    if (count > 0) {
      this.logger.log(`Sources already seeded (${count} found). Skipping.`);
      return;
    }

    const initialSources: Omit<Source, '_id'>[] = [
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
        baseUrl: 'https://www.foundingfuel.com',
        type: 'scraper',
        rssUrl: 'http://www.foundingfuel.com/rss/latest',
      },
    ];

    await this.sourceModel.insertMany(initialSources);
    this.logger.log(`Seeded ${initialSources.length} sources.`);
  }

  async create(createSourceDto: CreateSourceDto): Promise<SourceDocument> {
    const newSource = new this.sourceModel(createSourceDto);
    return newSource.save();
  }

  async findAll(): Promise<SourceDocument[]> {
    return this.sourceModel.find().exec();
  }

  async findOne(id: string): Promise<SourceDocument> {
    const source = await this.sourceModel.findById(id).exec();
    if (!source) {
      throw new NotFoundException(`Source with ID ${id} not found`);
    }
    return source;
  }
}
