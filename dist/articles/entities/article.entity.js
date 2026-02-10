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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const swagger_1 = require("@nestjs/swagger");
class Article {
    constructor() {
        this.isPaywalled = false;
    }
}
exports.Article = Article;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The unique identifier of the article' }),
    __metadata("design:type", String)
], Article.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'source-1', description: 'The ID of the source' }),
    __metadata("design:type", String)
], Article.prototype, "sourceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'The Future of AI', description: 'The title of the article' }),
    __metadata("design:type", String)
], Article.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/article', description: 'The canonical URL of the article' }),
    __metadata("design:type", String)
], Article.prototype, "canonicalUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A summary of the article...', description: 'Brief summary', required: false }),
    __metadata("design:type", String)
], Article.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The publication date' }),
    __metadata("design:type", Date)
], Article.prototype, "publishedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'The author name', required: false }),
    __metadata("design:type", String)
], Article.prototype, "authorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Technology', description: 'The topic/category', required: false }),
    __metadata("design:type", String)
], Article.prototype, "topic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/image.jpg', description: 'Article thumbnail URL', required: false }),
    __metadata("design:type", String)
], Article.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Whether the article is paywalled', required: false }),
    __metadata("design:type", Boolean)
], Article.prototype, "isPaywalled", void 0);
//# sourceMappingURL=article.entity.js.map