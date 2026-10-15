import {
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsString,
  IsDateString
} from 'class-validator';

export class CheckInDto {
  @IsNotEmpty({ message: 'employeeId không được để trống' })
  @IsMongoId({ message: 'employeeId phải là Mongo ObjectId hợp lệ' })
  employeeId: string;

  @IsOptional()
  @IsDateString({}, { message: 'checkIn phải đúng định dạng ngày/giờ ISO' })
  checkIn?: string;

  @IsOptional()
  @IsString({ message: 'note phải là chuỗi ký tự' })
  note?: string;
}