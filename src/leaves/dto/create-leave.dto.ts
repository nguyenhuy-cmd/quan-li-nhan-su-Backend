import {
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsOptional,
  IsEnum,
  IsString
} from 'class-validator';
import { LeaveType, LeaveStatus } from './leave.enum.js';


export class CreateLeaveDto {
  @IsNotEmpty({ message: 'employeeId không được để trống' })
  @IsMongoId({ message: 'employeeId phải là Mongo ObjectId hợp lệ' })
  employeeId: string;

  @IsOptional()
  @IsEnum(LeaveType, {
    message: 'type phải là một trong các giá trị: annual, sick, unpaid, other'
  })
  type?: LeaveType;

  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'startDate phải đúng định dạng ngày ISO (VD: YYYY-MM-DD)' })
  startDate: string;

  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString({}, { message: 'endDate phải đúng định dạng ngày ISO (VD: YYYY-MM-DD)' })
  endDate: string;

  @IsOptional()
  @IsString({ message: 'Lý do phải là chuỗi ký tự' })
  reason?: string;

  @IsOptional()
  @IsEnum(LeaveStatus, {
    message: 'status phải là một trong các giá trị: pending, approved, rejected'
  })
  status?: LeaveStatus;

  @IsOptional()
  @IsMongoId({ message: 'reviewedBy phải là Mongo ObjectId hợp lệ' })
  reviewedBy?: string;
}