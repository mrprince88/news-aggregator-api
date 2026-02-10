"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SourcesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let SourcesService = SourcesService_1 = class SourcesService {
    constructor() {
        this.sources = [];
        this.logger = new common_1.Logger(SourcesService_1.name);
    }
    onModuleInit() {
        this.seedInitialSources();
    }
    seedInitialSources() {
        if (this.sources.length > 0)
            return;
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
        initialSources.forEach((source) => {
            this.create(source);
        });
        this.logger.log(`Seeded ${this.sources.length} sources.`);
    }
    create(createSourceDto) {
        const newSource = {
            id: (0, crypto_1.randomUUID)(),
            ...createSourceDto,
        };
        this.sources.push(newSource);
        return newSource;
    }
    findAll() {
        return this.sources;
    }
    findOne(id) {
        const source = this.sources.find((s) => s.id === id);
        if (!source) {
            throw new common_1.NotFoundException(`Source with ID ${id} not found`);
        }
        return source;
    }
};
exports.SourcesService = SourcesService;
exports.SourcesService = SourcesService = SourcesService_1 = __decorate([
    (0, common_1.Injectable)()
], SourcesService);
//# sourceMappingURL=sources.service.js.map