import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type LeaveDocument = HydratedDocument<Leave>;

@Schema({ timestamps: true })
export class Leave {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['annual', 'sick', 'unpaid', 'other'], default: 'annual' })
  type: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ default: '' })
  reason: string;

  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  reviewedBy: MongooseSchema.Types.ObjectId;
}

export const LeavesSchema = SchemaFactory.createForClass(Leave);

LeavesSchema.index({ employeeId: 1, startDate: -1 });
