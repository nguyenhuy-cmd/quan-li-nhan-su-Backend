import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AttendancesService } from './attendances.service.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { CheckOutDto } from './dto/check-out.dto.js';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../users/entities/user.schemas.js';

@Controller('attendances')
@UseGuards(JwtAuthGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) { }

  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.HR)
  @ResponseMessage('Đã check in thành công')
  @Post('check-in')
  checkIn(@Body() checkInDto: CheckInDto) {
    return this.attendancesService.checkIn(checkInDto);
  }

  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.HR)
  @ResponseMessage('Đã chack out thành công')
  @Post('check-out')
  checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.attendancesService.checkOut(checkOutDto);
  }

  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.HR)
  @ResponseMessage('Xem chi tiết chấm lương')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(id);
  }
}
