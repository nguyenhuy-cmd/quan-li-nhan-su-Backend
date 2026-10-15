import {
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsString,
  IsDateString
} from 'class-validator';

export class CheckOutDto {
  @IsNotEmpty({ message: 'employeeId không được để trống' })
  @IsMongoId({ message: 'employeeId phải là Mongo ObjectId hợp lệ' })
  employeeId: string;

  @IsOptional()
  @IsDateString({}, { message: 'checkOut phải đúng định dạng ngày/giờ ISO' })
  checkOut?: string;

  @IsOptional()
  @IsString({ message: 'note phải là chuỗi ký tự' })
  note?: string;
}