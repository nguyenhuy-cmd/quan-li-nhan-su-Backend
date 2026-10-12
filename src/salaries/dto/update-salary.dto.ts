import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaryDto } from './create-salary.dto.js';

export class UpdateSalaryDto extends PartialType(CreateSalaryDto) {}
