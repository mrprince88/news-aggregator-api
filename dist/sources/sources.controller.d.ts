import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { Source } from './entities/source.entity';
export declare class SourcesController {
    private readonly sourcesService;
    constructor(sourcesService: SourcesService);
    create(createSourceDto: CreateSourceDto): Source;
    findAll(): Source[];
    findOne(id: string): Source;
}
