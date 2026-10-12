import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsMongoId,
  IsDateString,
} from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  PROBATION = 'probation',
  RESIGNED = 'resigned',
}

export class CreateEmployeeDto {
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  @IsString({ message: 'Mã nhân viên phải là chuỗi' })
  code: string;

  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  fullName: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  phone?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính phải là male, female hoặc other' })
  gender?: Gender;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh phải đúng định dạng ngày tháng (YYYY-MM-DD)' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address?: string;

  @IsNotEmpty({ message: 'Ngày vào làm không được để trống' })
  @IsDateString({}, { message: 'Ngày vào làm phải đúng định dạng ngày tháng (YYYY-MM-DD)' })
  hireDate: string;

  @IsNotEmpty({ message: 'Mức lương không được để trống' })
  @IsNumber({}, { message: 'Mức lương phải là số' })
  @Min(0, { message: 'Mức lương không được nhỏ hơn 0' })
  salary: number;

  @IsOptional()
  @IsMongoId({ message: 'Department ID phải là ObjectId hợp lệ' })
  departmentId?: string;

  @IsOptional()
  @IsMongoId({ message: 'Position ID phải là ObjectId hợp lệ' })
  positionId?: string;

  @IsOptional()
  @IsMongoId({ message: 'User ID phải là ObjectId hợp lệ' })
  userId?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus, { message: 'Trạng thái phải là active, probation hoặc resigned' })
  status?: EmployeeStatus;
}