import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service.js';

import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { register } from 'module';
import { LoginDto, RegisterDto } from './dto/create-auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ResponseMessage('Đăng nhập thành công')
  @Post('login')
  async login(@Body() loginDto: LoginDto){
    return await this.authService.login(loginDto)
  }

  @ResponseMessage('Đăng kí thành công')
  @Post('register')
  async register(@Body() registerDto: RegisterDto){
    return await this.authService.register(registerDto)
  }
}
