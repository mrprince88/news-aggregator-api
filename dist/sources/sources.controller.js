"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcesController = void 0;
const common_1 = require("@nestjs/common");
const sources_service_1 = require("./sources.service");
const create_source_dto_1 = require("./dto/create-source.dto");
const swagger_1 = require("@nestjs/swagger");
const source_entity_1 = require("./entities/source.entity");
let SourcesController = class SourcesController {
    constructor(sourcesService) {
        this.sourcesService = sourcesService;
    }
    create(createSourceDto) {
        return this.sourcesService.create(createSourceDto);
    }
    findAll() {
        return this.sourcesService.findAll();
    }
    findOne(id) {
        return this.sourcesService.findOne(id);
    }
};
exports.SourcesController = SourcesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new source' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The source has been successfully created.', type: source_entity_1.Source }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_source_dto_1.CreateSourceDto]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all sources' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all sources.', type: [source_entity_1.Source] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a source by id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the source.', type: source_entity_1.Source }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Source not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "findOne", null);
exports.SourcesController = SourcesController = __decorate([
    (0, swagger_1.ApiTags)('sources'),
    (0, common_1.Controller)('sources'),
    __metadata("design:paramtypes", [sources_service_1.SourcesService])
], SourcesController);
//# sourceMappingURL=sources.controller.js.map