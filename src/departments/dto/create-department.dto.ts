import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString({ message: 'Mã phòng ban phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã phòng ban không được để trống' })
  code: string;

  @IsString({ message: 'Tên phòng ban phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên phòng ban không được để trống' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;

  @IsMongoId({ message: 'ID Trưởng phòng (managerId) phải là ObjectId hợp lệ' })
  @IsOptional()
  managerId?: string;

  @IsEnum(['active', 'inactive'], {
    message: 'Trạng thái chỉ có thể là active hoặc inactive',
  })
  @IsOptional()
  status?: string;
}
export class QueryDepartmentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang hiện tại phải là số nguyên' })
  @Min(1, { message: 'Trang hiện tại tối thiểu là 1' })
  current?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng bản ghi trên trang phải là số nguyên' })
  @Min(1, { message: 'Số lượng bản ghi tối thiểu là 1' })
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;
}