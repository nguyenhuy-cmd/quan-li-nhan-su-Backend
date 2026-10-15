import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Department } from './entities/department.entity.js';
import { Model } from 'mongoose';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>
  ) { }
  async create(createDepartmentDto: CreateDepartmentDto) {
    const newDepartment = new this.departmentModel(createDepartmentDto)
    return await newDepartment.save()
  }

  async findAll(currentPage: string, limit: string, qs: any) {
    const page = parseInt(currentPage) || 1;
    const defaultLimit = parseInt(limit) || 10;

    const skip = (page - 1) * defaultLimit;

    // Tìm kiếm theo username và email
    const whereCondition: any = {};
    if (qs?.name) {
      whereCondition.name = { $regex: qs.name, $options: 'i' }
    }
    if (qs?.code) {
      whereCondition.code = { $regex: qs.code, $options: 'i' }
    }

    // Lấy dữ liệu và đêmns tổng số bản ghi
    const totalItem = await this.departmentModel.countDocuments(whereCondition)
    const result = await this.departmentModel.find(whereCondition)
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


  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const update = await this.departmentModel.findByIdAndUpdate(id, updateDepartmentDto);
    if (!update) {
      throw new NotFoundException('Không tìm thấy phòng ban')
    }
    return {
      id: id,
      update
    }
  }

  async remove(id: string) {
    const deleteDep = await this.departmentModel.findByIdAndDelete(id);
    if (!deleteDep) {
      throw new NotFoundException('Không tìm thấy phòng ban')
    }
    return {
      id: id,
      deleteDep
    }
  }
}
