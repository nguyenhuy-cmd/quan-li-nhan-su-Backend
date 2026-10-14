import {
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsNumber,
  Min,
  IsOptional,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SalaryStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

export class CreateSalaryDto {
  @IsNotEmpty({ message: 'employeeId không được để trống' })
  @IsMongoId({ message: 'employeeId phải là Mongo ObjectId hợp lệ' })
  employeeId: string;

  @IsNotEmpty({ message: 'Tháng trả lương không được để trống' })
  @IsDateString({}, { message: 'month phải đúng định dạng ngày ISO (VD: YYYY-MM-DD)' })
  month: string;

  @IsNotEmpty({ message: 'Lương cơ bản không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'baseSalary phải là số' })
  @Min(0, { message: 'baseSalary không được nhỏ hơn 0' })
  baseSalary: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'allowance phải là số' })
  @Min(0, { message: 'allowance không được nhỏ hơn 0' })
  allowance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'bonus phải là số' })
  @Min(0, { message: 'bonus không được nhỏ hơn 0' })
  bonus?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'deduction phải là số' })
  @Min(0, { message: 'deduction không được nhỏ hơn 0' })
  deduction?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'netSalary phải là số' })
  @Min(0, { message: 'netSalary không được nhỏ hơn 0' })
  netSalary?: number;

  @IsOptional()
  @IsEnum(SalaryStatus, { message: 'status phải là pending hoặc paid' })
  status?: SalaryStatus;

  @IsOptional()
  @IsDateString({}, { message: 'payDate phải đúng định dạng ngày ISO' })
  payDate?: string;
}