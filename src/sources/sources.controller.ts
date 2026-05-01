import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Source } from './entities/source.entity';

@ApiTags('sources')
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new source' })
  @ApiResponse({ status: 201, description: 'The source has been successfully created.', type: Source })
  async create(@Body() createSourceDto: CreateSourceDto) {
    return this.sourcesService.create(createSourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all sources' })
  @ApiResponse({ status: 200, description: 'Return all sources.', type: [Source] })
  async findAll() {
    return this.sourcesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a source by id' })
  @ApiResponse({ status: 200, description: 'Return the source.', type: Source })
  @ApiResponse({ status: 404, description: 'Source not found.' })
  async findOne(@Param('id') id: string) {
    return this.sourcesService.findOne(id);
  }
}
