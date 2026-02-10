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
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const articles_service_1 = require("./articles.service");
const swagger_1 = require("@nestjs/swagger");
const article_entity_1 = require("./entities/article.entity");
let ArticlesController = class ArticlesController {
    constructor(articlesService) {
        this.articlesService = articlesService;
    }
    findAll(query) {
        return this.articlesService.findAll(query);
    }
    findOne(id) {
        return this.articlesService.findOne(id);
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated articles' }),
    (0, swagger_1.ApiQuery)({ name: 'source', required: false, description: 'Filter by source ID' }),
    (0, swagger_1.ApiQuery)({ name: 'topic', required: false, description: 'Filter by topic' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page', example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: 'Pagination offset', example: 0 }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Date from (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'Date to (ISO string)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return paginated articles.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an article by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the article.', type: article_entity_1.Article }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findOne", null);
exports.ArticlesController = ArticlesController = __decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Controller)('articles'),
    __metadata("design:paramtypes", [articles_service_1.ArticlesService])
], ArticlesController);
//# sourceMappingURL=articles.controller.js.map