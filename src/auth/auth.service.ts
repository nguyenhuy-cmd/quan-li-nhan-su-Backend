import { UsersService } from './../users/users.service.js';

import { Injectable } from '@nestjs/common';

import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.schemas.js';

@Injectable()
export class AuthService {
  constructor(
    
    private readonly usersService: UsersService
  ){}
}
