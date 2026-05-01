import { Document } from 'mongoose';
export declare class Article {
    _id: string;
    sourceId: string;
    title: string;
    canonicalUrl: string;
    summary?: string;
    publishedAt: Date;
    authorName?: string;
    topic?: string;
    imageUrl?: string;
    isPaywalled?: boolean;
}
export type ArticleDocument = Article & Document;
export declare const ArticleSchema: import("mongoose").Schema<Article, import("mongoose").Model<Article, any, any, any, any, any, Article>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Article, Document<unknown, {}, Article, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
    _id: string;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<string, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sourceId?: import("mongoose").SchemaDefinitionProperty<string, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    canonicalUrl?: import("mongoose").SchemaDefinitionProperty<string, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    summary?: import("mongoose").SchemaDefinitionProperty<string | undefined, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    publishedAt?: import("mongoose").SchemaDefinitionProperty<Date, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    authorName?: import("mongoose").SchemaDefinitionProperty<string | undefined, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    topic?: import("mongoose").SchemaDefinitionProperty<string | undefined, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    imageUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isPaywalled?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, Article, Document<unknown, {}, Article, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Article & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Article>;
