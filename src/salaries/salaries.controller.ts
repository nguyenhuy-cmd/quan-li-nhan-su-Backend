import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SalariesService } from './salaries.service.js';
import { CreateSalaryDto } from './dto/create-salary.dto.js';
import { UpdateSalaryDto } from './dto/update-salary.dto.js';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../users/entities/user.schemas.js';

@Controller('salaries')
@UseGuards(JwtAuthGuard)
export class SalariesController {
  constructor(private readonly salariesService: SalariesService) { }

  @ResponseMessage('Tạo hồ sơ nhân viên thành công')
  @Roles(Role.ADMIN, Role.HR)
  @Post()
  async create(@Body() createSalaryDto: CreateSalaryDto) {
    return await this.salariesService.create(createSalaryDto);
  }


  @ResponseMessage('Xem lương thành công')
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageLimit') limit: string,
    @Query('qs') qs: any
  ) {
    return this.salariesService.findAll(currentPage, limit, qs);
  }



  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalaryDto: UpdateSalaryDto) {
    return this.salariesService.update(id, updateSalaryDto);
  }


}
