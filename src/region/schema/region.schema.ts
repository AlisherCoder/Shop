import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RegionDocument = HydratedDocument<Region>;

@Schema({versionKey: false})
export class Region {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  users: mongoose.Types.ObjectId[];
}

export const RegionSchema = SchemaFactory.createForClass(Region);
