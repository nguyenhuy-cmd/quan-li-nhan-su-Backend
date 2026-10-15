import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveDto } from './create-leave.dto.js';

export class UpdateLeafDto extends PartialType(CreateLeaveDto) { }
