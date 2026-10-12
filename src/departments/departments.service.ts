import { Injectable } from '@nestjs/common';
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
  ){}
  async create(createDepartmentDto: CreateDepartmentDto) {
    const newDepartment = new this.departmentModel(createDepartmentDto)
    return await newDepartment.save()
  }

  findAll() {
    return `This action returns all departments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} department`;
  }

  update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    return `This action updates a #${id} department`;
  }

  remove(id: number) {
    return `This action removes a #${id} department`;
  }
}
