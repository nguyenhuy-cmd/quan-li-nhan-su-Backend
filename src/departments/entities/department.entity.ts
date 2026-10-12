import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, unique: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', default: null })
  managerId: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
