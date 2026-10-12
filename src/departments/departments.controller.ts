import { ResponseMessage } from './../common/decorators/response-message.decorator.js';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard.js';
import { Role } from '../users/entities/user.schemas.js';
import { Roles } from '../common/decorators/roles.decorator.js';


@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @ResponseMessage('Tạo phòng ban thành công')
  @Post()
  @Roles(Role.ADMIN, Role.HR)
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @ResponseMessage('Xem tất cả ')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.HR)
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageLimit') limit: string,
    @Query('qs') qs: any,
    
  ) {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(+id, updateDepartmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(+id);
  }
}
