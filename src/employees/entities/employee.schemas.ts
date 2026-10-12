import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true, default: '' })
  phone: string;

  @Prop({ enum: ['male', 'female', 'other'], default: 'male' })
  gender: string;

  @Prop({ type: Date, default: null })
  dateOfBirth: Date;

  @Prop({ default: '' })
  address: string;

  @Prop({ required: true, type: Date })
  hireDate: Date;

  @Prop({ required: true, min: 0, default: 0 })
  salary: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', default: null })
  departmentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position', default: null })
  positionId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['active', 'probation', 'resigned'], default: 'active' })
  status: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

EmployeeSchema.index({ departmentId: 1 });
EmployeeSchema.index({ positionId: 1 });
