import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum PositionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreatePositionDto {
  @IsNotEmpty({ message: 'Mã chức danh không được để trống' })
  @IsString({ message: 'Mã chức danh phải là chuỗi' })
  code: string;

  @IsNotEmpty({ message: 'Tên chức danh không được để trống' })
  @IsString({ message: 'Tên chức danh phải là chuỗi' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @IsNotEmpty({ message: 'Cấp bậc (level) không được để trống' })
  @IsNumber({}, { message: 'Cấp bậc phải là số' })
  @Min(1, { message: 'Cấp bậc tối thiểu phải là 1' })
  level: number;

  @IsNotEmpty({ message: 'Lương cơ bản không được để trống' })
  @IsNumber({}, { message: 'Lương cơ bản phải là số' })
  @Min(0, { message: 'Lương cơ bản không được nhỏ hơn 0' })
  baseSalary: number;

  @IsOptional()
  @IsEnum(PositionStatus, { message: 'Trạng thái phải là active hoặc inactive' })
  status?: PositionStatus;
}