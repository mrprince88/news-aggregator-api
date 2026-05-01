import { Document } from 'mongoose';
export type SyncStateDocument = SyncState & Document;
export declare class SyncState {
    key: string;
    lastRun: Date;
}
export declare const SyncStateSchema: import("mongoose").Schema<SyncState, import("mongoose").Model<SyncState, any, any, any, any, any, SyncState>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SyncState, Document<unknown, {}, SyncState, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SyncState & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    key?: import("mongoose").SchemaDefinitionProperty<string, SyncState, Document<unknown, {}, SyncState, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SyncState & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastRun?: import("mongoose").SchemaDefinitionProperty<Date, SyncState, Document<unknown, {}, SyncState, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SyncState & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, SyncState>;
