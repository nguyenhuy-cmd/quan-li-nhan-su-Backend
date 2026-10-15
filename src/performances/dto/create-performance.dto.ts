import {
    IsNotEmpty,
    IsMongoId,
    IsDateString,
    IsNumber,
    Min,
    Max,
    IsOptional,
    IsString
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePerformanceDto {
    @IsNotEmpty({ message: 'employeeId không được để trống' })
    @IsMongoId({ message: 'employeeId phải là Mongo ObjectId hợp lệ' })
    employeeId: string;

    @IsNotEmpty({ message: 'Kỳ đánh giá (period) không được để trống' })
    @IsDateString({}, { message: 'period phải đúng định dạng ngày ISO (VD: YYYY-MM-DD)' })
    period: string;

    @IsNotEmpty({ message: 'Điểm đánh giá (score) không được để trống' })
    @Type(() => Number)
    @IsNumber({}, { message: 'score phải là số' })
    @Min(0, { message: 'Điểm đánh giá tối thiểu là 0' })
    @Max(100, { message: 'Điểm đánh giá tối đa là 100' })
    score: number;

    @IsOptional()
    @IsString({ message: 'Nhận xét (comment) phải là chuỗi ký tự' })
    comment?: string;

    @IsOptional()
    @IsMongoId({ message: 'evaluatedBy phải là Mongo ObjectId hợp lệ' })
    evaluatedBy?: string;
}