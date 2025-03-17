import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Role {
  client = 'CLIENT',
  seller = 'SELLER',
  admin = 'ADMIN',
}

export interface Item {
  product: string;
  count: number;
  totalSum: number;
}

interface Order {
  totalPrice: number;
  products: Item[];
}

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  image: string;

  @Prop({ enum: Role, required: true })
  role: Role;

  @Prop()
  shopname: string;

  @Prop()
  location: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true })
  region: mongoose.Types.ObjectId;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Product' })
  products: mongoose.Types.ObjectId[];

  @Prop()
  orders: Order[];

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Comment',
    required: true,
  })
  comments: mongoose.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
