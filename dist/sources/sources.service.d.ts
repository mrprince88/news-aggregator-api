import { OnModuleInit } from '@nestjs/common';
import { CreateSourceDto } from './dto/create-source.dto';
import { Source } from './entities/source.entity';
export declare class SourcesService implements OnModuleInit {
    private sources;
    private readonly logger;
    onModuleInit(): void;
    private seedInitialSources;
    create(createSourceDto: CreateSourceDto): Source;
    findAll(): Source[];
    findOne(id: string): Source;
}
