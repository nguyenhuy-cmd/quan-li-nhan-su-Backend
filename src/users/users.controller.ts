import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from './entities/user.schemas.js';
@Controller('users')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN && Role.HR)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ResponseMessage('Đã thêm user thành công')
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @ResponseMessage('Hiển thị tất cả danh sách thành công')
  @Get()
  async findAll(
    @Query('current') currentPage: string,
    @Query('pageLimit') limit: string,
    @Query('qs') qs: any
    
  ) {
    return await this.usersService.findAll(currentPage, limit, qs);
  }

  @ResponseMessage('Hiển thị thông tin chi tiết 1 user')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @ResponseMessage('Cập nhập user thành công')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @ResponseMessage('Xóa user thành công')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
