import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Product' })
  products: mongoose.Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
