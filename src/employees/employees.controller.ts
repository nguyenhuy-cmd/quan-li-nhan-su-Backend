import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard.js';
import { Role } from '../users/entities/user.schemas.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @ResponseMessage('Tạo hồ sơ nhân viên thành công')
  @Roles(Role.ADMIN, Role.HR)
  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return await this.employeesService.create(createEmployeeDto);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Get()
  async findAll(
    @Query('current') currentPage: string,
    @Query('pageLimit') limit: string,
    @Query('qs') qs: any
  ) {
    return await this.employeesService.findAll(currentPage, limit, qs);
  }

  @Roles(Role.ADMIN, Role.HR, Role.EMPLOYEE)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.HR)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return await this.employeesService.update(id, updateEmployeeDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.employeesService.remove(id);
  }
}
