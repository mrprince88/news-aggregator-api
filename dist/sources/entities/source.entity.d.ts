import { Document } from 'mongoose';
export declare class Source {
    _id: string;
    name: string;
    baseUrl: string;
    type: 'rss' | 'scraper';
    rssUrl?: string;
}
export type SourceDocument = Source & Document;
export declare const SourceSchema: import("mongoose").Schema<Source, import("mongoose").Model<Source, any, any, any, any, any, Source>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Source, Document<unknown, {}, Source, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Source & Required<{
    _id: string;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<string, Source, Document<unknown, {}, Source, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Source & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Source, Document<unknown, {}, Source, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Source & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    baseUrl?: import("mongoose").SchemaDefinitionProperty<string, Source, Document<unknown, {}, Source, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Source & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<"rss" | "scraper", Source, Document<unknown, {}, Source, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Source & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rssUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, Source, Document<unknown, {}, Source, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Source & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Source>;
