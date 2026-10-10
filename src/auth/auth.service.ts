import { register } from 'module';
import { UsersService } from './../users/users.service.js';

import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.schemas.js';
import { LoginDto, RegisterDto } from './dto/create-auth.dto.js';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    
    private readonly usersService: UsersService,
     private readonly jwtService: JwtService, // Inject JwtService để tạo token
  ){}

  async login(loginDto: LoginDto){
    const email = await this.usersService.findByEmail(loginDto.email)
    if(!email){
      throw new NotFoundException('Email và mật khẩu không đúng')
    }

    const isPassword = compareSync(loginDto.password, email.password)
    if(!isPassword){
      throw new NotFoundException('Email và mật khẩu không đúng')
    }

    const payload = {
      sub: email._id,
      email: email.email,
      username: email.username,
      role: email.role
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: email._id,
        email: email.email,
        username: email.username,
        role: email.role
      }
    }
  }

  async register(registerDto: RegisterDto){
    const newUser = await this.usersService.create(registerDto)
    return {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  }
}
