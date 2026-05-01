import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateSourceDto } from './dto/create-source.dto';
import { SourceDocument } from './entities/source.entity';
export declare class SourcesService implements OnModuleInit {
    private readonly sourceModel;
    private readonly logger;
    constructor(sourceModel: Model<SourceDocument>);
    onModuleInit(): Promise<void>;
    private seedInitialSources;
    create(createSourceDto: CreateSourceDto): Promise<SourceDocument>;
    findAll(): Promise<SourceDocument[]>;
    findOne(id: string): Promise<SourceDocument>;
}
