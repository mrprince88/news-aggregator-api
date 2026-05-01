import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SyncStateDocument = SyncState & Document;

@Schema({ timestamps: true })
export class SyncState {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop()
  lastRun: Date;
}

export const SyncStateSchema = SchemaFactory.createForClass(SyncState);
