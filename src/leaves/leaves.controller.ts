import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LeavesService } from './leaves.service.js';
import { CreateLeaveDto } from './dto/create-leave.dto.js';
import { UpdateLeafDto } from './dto/update-leaf.dto.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../users/entities/user.schemas.js';
import { ApproveLeaveDto } from './dto/approve-leave.dto.js';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) { }

  @Roles(Role.ADMIN, Role.HR, Role.EMPLOYEE)
  @ResponseMessage('Tạo đơn xin nghỉ phép thanhf coong')
  @Post()
  async create(@Body() createLeaveDto: CreateLeaveDto) {
    return await this.leavesService.create(createLeaveDto);
  }

  @Roles(Role.ADMIN, Role.HR)
  @ResponseMessage('Lấy danh sách các đơn xin nghỉ thành công')
  @Get()
  async findAll(
    @Query('current') currentPage: string,
    @Query('pageLimit') limit: string,
    @Query('qs') qs: any) {
    return await this.leavesService.findAll(currentPage, limit, qs);
  }

  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.HR)
  @ResponseMessage('Lấy chi tiết đơn xin nghỉ thành công')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.leavesService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @ResponseMessage('Đơn xin nghỉ thành công')
  @Patch(':id/approve')
  async update(
    @Param('id') id: string,
    @Body() approveLeaveDto: ApproveLeaveDto) {
    return await this.leavesService.update(id, approveLeaveDto);
  }


}
