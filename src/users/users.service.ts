import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Role, User } from './entities/user.schemas.js';
import { Mode } from 'fs';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ){}
  // Số vòng lặp mã hóa (Salt Rounds) - Mặc định 10 là chuẩn và an toàn
  private readonly SALT_ROUNDS = 10;
  // 1. Hàm băm mật khẩu
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  }
  // 2. Hàm so sánh mật khẩu nhập vào với mật khẩu đã băm trong DB
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.hashPassword(createUserDto.password)

    const newUser = new this.userModel(createUserDto);
    return await newUser.save()
  }

  async findAll(currentPage: string, limit: string, qs: any) {
    const page = parseInt(currentPage) || 1;
    const defaultLimit = parseInt(limit) || 10;

    const skip = (page - 1) * defaultLimit;

    // Tìm kiếm theo username và email
    const whereCondition: any = {};
    if(qs?.username){
      whereCondition.username = {$regex: qs.username, $options: 'i'}
    }
    if(qs?.email){
      whereCondition.email = {$regex: qs.email, $options: 'i'}
    }

    // Lấy dữ liệu và đêmns tổng số bản ghi
    const totalItem =  await this.userModel.countDocuments(whereCondition)
    const result = await  this.userModel.find(whereCondition)
    .skip(skip)
    .limit(defaultLimit)
    .sort({_id: -1})
    .lean()

    // Tính tổng số trang
    const totalPage = Math.ceil(totalItem/ defaultLimit)

    // Xóa  trường password trước khi trả về frontend
    const safeResult = result.map(user => {
      const {password, ...result} = user;
      return result
   })

   return {
    meta: {
      current: page,
      pageSize: defaultLimit,
      pages: totalPage,
      total: totalItem
    },
    result: safeResult 
   }
  }

  async findOne(id: string) {
    const exUser = await this.userModel.findById(id)
    if(!exUser){
      throw new NotFoundException('Không tìm thấy user')
    }
    return {
      id: id,
      exUser
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updateUser = await this.userModel.findByIdAndUpdate(id, updateUserDto)
    if(!updateUser){
      throw new NotFoundException('Không tìm thấy user')
    }
    return {
      message: 'Đã cập nhập thành công',
      id: id, 
      updateUser
    }
  }

  async remove(id: string) {
    const deleteUser = await this.userModel.findByIdAndDelete(id)
    if(!deleteUser){
      throw new NotFoundException('Không tìm thấy user')
    }
    return {
      message: 'Đã xóa user thành công',
      id: id,
      deleteUser
    }
  }

  // Tìm user theo email
  async findByEmail(email: string){
    return await this.userModel.findOne({email})
  }

  // Nick admin
  async createAdmin(){
    const admin = 'admin@gmail.com';
    const exAdmin = await this.userModel.findOne({email: admin})

    if(!exAdmin){
      const hashPassword = await bcrypt.hash('123456', 10)
      await this.userModel.create({
        username: 'admin',
        email: admin,
        password: hashPassword,
        role: Role.ADMIN
      });
      console.log("ĐÃ lập Admin thành công");
      
    }
    
  }
}
