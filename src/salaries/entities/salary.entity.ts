import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type SalaryDocument = HydratedDocument<Salary>;

@Schema({ timestamps: true })
export class Salary {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: Date })
  month: Date;

  @Prop({ required: true, min: 0, default: 0 })
  baseSalary: number;

  @Prop({ min: 0, default: 0 })
  allowance: number;

  @Prop({ min: 0, default: 0 })
  bonus: number;

  @Prop({ min: 0, default: 0 })
  deduction: number;

  @Prop({ min: 0, default: 0 })
  netSalary: number;

  @Prop({ enum: ['pending', 'paid'], default: 'pending' })
  status: string;

  @Prop({ type: Date, default: null })
  payDate: Date;
}

export const SalarySchema = SchemaFactory.createForClass(Salary);

SalarySchema.index({ employeeId: 1, month: -1 });
