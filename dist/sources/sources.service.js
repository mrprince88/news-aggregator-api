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
var SourcesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const source_entity_1 = require("./entities/source.entity");
let SourcesService = SourcesService_1 = class SourcesService {
    constructor(sourceModel) {
        this.sourceModel = sourceModel;
        this.logger = new common_1.Logger(SourcesService_1.name);
    }
    async onModuleInit() {
        await this.seedInitialSources();
    }
    async seedInitialSources() {
        const count = await this.sourceModel.countDocuments();
        if (count > 0) {
            this.logger.log(`Sources already seeded (${count} found). Skipping.`);
            return;
        }
        const initialSources = [
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
                baseUrl: 'https://foundingfuel.com',
                type: 'rss',
                rssUrl: 'http://www.foundingfuel.com/rss/latest',
            },
        ];
        await this.sourceModel.insertMany(initialSources);
        this.logger.log(`Seeded ${initialSources.length} sources.`);
    }
    async create(createSourceDto) {
        const newSource = new this.sourceModel(createSourceDto);
        return newSource.save();
    }
    async findAll() {
        return this.sourceModel.find().exec();
    }
    async findOne(id) {
        const source = await this.sourceModel.findById(id).exec();
        if (!source) {
            throw new common_1.NotFoundException(`Source with ID ${id} not found`);
        }
        return source;
    }
};
exports.SourcesService = SourcesService;
exports.SourcesService = SourcesService = SourcesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(source_entity_1.Source.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SourcesService);
//# sourceMappingURL=sources.service.js.map