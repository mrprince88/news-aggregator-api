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
exports.SourceSchema = exports.Source = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
let Source = class Source {
};
exports.Source = Source;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The unique identifier of the source' }),
    __metadata("design:type", String)
], Source.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Aeon', description: 'The name of the publication' }),
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Source.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://aeon.co', description: 'The base URL of the publication' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Source.prototype, "baseUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'rss', enum: ['rss', 'scraper'], description: 'The type of ingestion' }),
    (0, mongoose_1.Prop)({ required: true, enum: ['rss', 'scraper'] }),
    __metadata("design:type", String)
], Source.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://aeon.co/feed.rss', description: 'The RSS feed URL (optional)', required: false }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Source.prototype, "rssUrl", void 0);
exports.Source = Source = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'sources' })
], Source);
exports.SourceSchema = mongoose_1.SchemaFactory.createForClass(Source);
//# sourceMappingURL=source.entity.js.map