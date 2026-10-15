import { PositionsService } from './../positions/positions.service.js';
import { UsersService } from './../users/users.service.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Employee } from './entities/employee.schemas.js';
import { Model } from 'mongoose';
import { Department } from '../departments/entities/department.entity.js';
import { DepartmentsService } from '../departments/departments.service.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
  ) { }
  async create(createEmployeeDto: CreateEmployeeDto) {
    const newEmployees = new this.employeeModel(createEmployeeDto)
    return await newEmployees.save()
  }

  async findAll(currentPage: string, limit: string, qs: any) {
    const page = parseInt(currentPage) || 1;
    const defaultLimit = parseInt(limit) || 10;

    const skip = (page - 1) * defaultLimit;

    const whereCondition: any = {};
    if (qs?.fullName) {
      whereCondition.fullName = { $regex: qs.fullName, $options: 'i' }
    }
    if (qs?.code) {
      whereCondition.code = { $regex: qs.code, $options: 'i' }
    }
    if (qs?.email) {
      whereCondition.email = { $regex: qs.email, $options: 'i' }
    }
    if (qs?.phone) {
      whereCondition.phone = { $regex: qs.code, $options: 'i' }
    }

    const totalItem = await this.employeeModel.countDocuments(whereCondition)
    const result = await this.employeeModel.find(whereCondition)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ _id: -1 })
      .lean()

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

  async findOne(id: number) {
    const exEmployees = await this.employeeModel.findById(id)
    if (!exEmployees) {
      throw new NotFoundException('không tìm đc nhân viên')
    }
    return {
      id: id,
      exEmployees
    }
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const updateEmployees = await this.employeeModel.findByIdAndUpdate(id, updateEmployeeDto)
    if (!updateEmployees) {
      throw new NotFoundException('Không tìm thấy nhân viên')
    }
    return {
      message: 'Cập nhập nhân viên đã thành công',
      id: id,
      updateEmployees
    }
  }

  async remove(id: number) {
    const deleteEmployees = await this.employeeModel.findByIdAndDelete(id)
    if (!deleteEmployees) {
      throw new NotFoundException('Không tìm thấy nhân viên')
    }
    return {
      message: 'Đã xóa thành công nhân viên',
      id: id,
      deleteEmployees
    }
  }
}
