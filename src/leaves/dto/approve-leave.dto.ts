import { IsNotEmpty, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { LeaveStatus } from './leave.enum.js';

export class ApproveLeaveDto {
  @IsNotEmpty({ message: 'Trạng thái duyệt không được để trống' })
  @IsEnum(LeaveStatus, { message: 'status phải là approved hoặc rejected' })
  status: LeaveStatus;

  @IsNotEmpty({ message: 'reviewedBy không được để trống' })
  @IsMongoId({ message: 'reviewedBy phải là Mongo ObjectId hợp lệ' })
  reviewedBy: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú duyệt phải là chuỗi ký tự' })
  reason?: string; // Lý do chấp nhận hoặc từ chối (tùy chọn)
}