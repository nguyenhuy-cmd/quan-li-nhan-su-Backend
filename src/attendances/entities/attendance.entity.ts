import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: Date, default: null })
  checkIn: Date;

  @Prop({ type: Date, default: null })
  checkOut: Date;

  @Prop({ enum: ['present', 'late', 'absent', 'leave', 'remote'], default: 'present' })
  status: string;

  @Prop({ default: '' })
  note: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
