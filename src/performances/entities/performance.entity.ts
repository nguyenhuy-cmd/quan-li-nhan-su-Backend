import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PerformanceDocument = HydratedDocument<Performance>;

@Schema({ timestamps: true })
export class Performance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: Date })
  period: Date;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;

  @Prop({ default: '' })
  comment: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  evaluatedBy: MongooseSchema.Types.ObjectId;
}

export const PerformanceSchema = SchemaFactory.createForClass(Performance);

PerformanceSchema.index({ employeeId: 1, period: -1 });
