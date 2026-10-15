import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PerformancesService } from './performances.service.js';
import { CreatePerformanceDto } from './dto/create-performance.dto.js';
import { UpdatePerformanceDto } from './dto/update-performance.dto.js';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../users/entities/user.schemas.js';

@Controller('performances')
@UseGuards(JwtAuthGuard)
export class PerformancesController {
  constructor(private readonly performancesService: PerformancesService) { }

  @Roles(Role.ADMIN, Role.HR, Role.EMPLOYEE)
  @ResponseMessage('Thêm đánh giá thành công')
  @Post()
  create(@Body() createPerformanceDto: CreatePerformanceDto) {
    return this.performancesService.create(createPerformanceDto);
  }

  @ResponseMessage('Xem đánh giá của 1 nhân viên thành công')
  @Roles(Role.ADMIN, Role.HR, Role.EMPLOYEE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.performancesService.findOne(+id);
  }
}
