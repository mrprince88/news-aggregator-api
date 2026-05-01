import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
export declare class SourcesController {
    private readonly sourcesService;
    constructor(sourcesService: SourcesService);
    create(createSourceDto: CreateSourceDto): Promise<import("./entities/source.entity").SourceDocument>;
    findAll(): Promise<import("./entities/source.entity").SourceDocument[]>;
    findOne(id: string): Promise<import("./entities/source.entity").SourceDocument>;
}
