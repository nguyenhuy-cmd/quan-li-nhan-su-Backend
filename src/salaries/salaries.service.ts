import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (qs?.employeeId) {
      whereCondition.employeeId = { $regex: qs.employeeId, $options: 'i' }
    }
    if (qs?.status) {
      whereCondition.status = { $regex: qs.status, $options: 'i' }
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
      },
      result
    }
  }


  async update(id: string, updateSalaryDto: UpdateSalaryDto) {
    const updateSalary = await this.salaryModel.findByIdAndUpdate(
      id,
      updateSalaryDto,
      { new: true } // Trả về dữ liệu mới sau khi đã cập nhật
    );

    if (!updateSalary) {
      throw new NotFoundException('Không tìm thấy mức lương');
    }

    return updateSalary;
  }
}
