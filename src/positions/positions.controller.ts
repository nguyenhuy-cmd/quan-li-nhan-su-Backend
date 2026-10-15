import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PositionsService } from './positions.service.js';
import { CreatePositionDto } from './dto/create-position.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard.js';
import { Role } from '../users/entities/user.schemas.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';


@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) { }

  @ResponseMessage('Tạo quản lí chức danh thành công')
  @Post()
  @Roles(Role.ADMIN, Role.HR)
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @ResponseMessage('Xem tất cả quản lý chức danh thành công')
  @Roles(Role.ADMIN, Role.HR, Role.EMPLOYEE)
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageLimit') limit: string,
    @Query('qs') qs: any

  ) {
    return this.positionsService.findAll(currentPage, limit, qs);
  }


  @ResponseMessage('Cập nhật chức danh thành công')
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @ResponseMessage('Xóa chức danh thành công')
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.positionsService.remove(id);
  }
}
