import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PositionDocument = HydratedDocument<Position>;

@Schema({ timestamps: true })
export class Position {
  @Prop({ required: true, unique: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, min: 1, default: 1 })
  level: number;

  @Prop({ required: true, min: 0, default: 0 })
  baseSalary: number;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const PositionSchema = SchemaFactory.createForClass(Position);
