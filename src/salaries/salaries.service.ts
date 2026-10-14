import { Injectable } from '@nestjs/common';
import { CreateSalaryDto } from './dto/create-salary.dto.js';
import { UpdateSalaryDto } from './dto/update-salary.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Salary } from './entities/salary.entity.js';
import { Model } from 'mongoose';

@Injectable()
export class SalariesService {
  constructor(
    @InjectModel(Salary.name)
    private readonly salaryModel: Model<Salary>
  ) { }
  async create(createSalaryDto: CreateSalaryDto) {
    const newSalari = new this.salaryModel(createSalaryDto)
    return await newSalari.save();
  }

  async findAll(currentPage: string, limit: string, qs: any) {
    const page = parseInt(currentPage) || 1;
    const defaultLimit = parseInt(limit) || 10;

    const skip = (page - 1) * defaultLimit;

    // Tìm kiếm theo username và email
    const whereCondition: any = {};
    if (qs?.username) {
      whereCondition.username = { $regex: qs.username, $options: 'i' }
    }
    if (qs?.email) {
      whereCondition.email = { $regex: qs.email, $options: 'i' }
    }

    // Lấy dữ liệu và đêmns tổng số bản ghi
    const totalItem = await this.salaryModel.countDocuments(whereCondition)
    const result = await this.salaryModel.find(whereCondition)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ _id: -1 })
      .lean()

    // Tính tổng số trang
    const totalPage = Math.ceil(totalItem / defaultLimit)

    return {
      meta: {
        current: page,
        pageSize: defaultLimit,
        pages: totalPage,
        total: totalItem
      }
    }
  }


  async update(id: number, updateSalaryDto: UpdateSalaryDto) {
    const upddateSalary = await this.salaryModel.findOneAndUpdate(id, updateSalaryDto)
  }


}
