import {
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsOptional,
  IsEnum,
  IsString
} from 'class-validator';

export enum AttendanceStatus {
  PRESENT = 'present',
  LATE = 'late',
  ABSENT = 'absent',
  LEAVE = 'leave',
}

export class CreateAttendanceDto {
  @IsNotEmpty({ message: 'employeeId không được để trống' })
  @IsMongoId({ message: 'employeeId phải là Mongo ObjectId hợp lệ' })
  employeeId: string;

  @IsNotEmpty({ message: 'Ngày chấm công không được để trống' })
  @IsDateString({}, { message: 'date phải đúng định dạng ngày ISO (VD: YYYY-MM-DD)' })
  date: string;

  @IsOptional()
  @IsDateString({}, { message: 'checkIn phải đúng định dạng ngày/giờ ISO' })
  checkIn?: string;

  @IsOptional()
  @IsDateString({}, { message: 'checkOut phải đúng định dạng ngày/giờ ISO' })
  checkOut?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus, {
    message: 'status phải là một trong các giá trị: present, late, absent, leave, remote'
  })
  status?: AttendanceStatus;

  @IsOptional()
  @IsString({ message: 'note phải là chuỗi ký tự' })
  note?: string;
}