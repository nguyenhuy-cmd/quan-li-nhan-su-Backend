import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Position } from './entities/position.entity.js';
import { Model } from 'mongoose';

@Injectable()
export class PositionsService {
  constructor(
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>
  ) { }
  async create(createPositionDto: CreatePositionDto) {
    const newPosition = new this.positionModel(createPositionDto)
    return await newPosition.save()
  }

  async findAll(currentPage: string, limit: string, qs: any) {
    const page = parseInt(currentPage) || 1;
    const defaultLimit = parseInt(limit) || 10;

    const skip = (page - 1) * defaultLimit;

    // Tìm kiếm theo username và email
    const whereCondition: any = {};
    if (qs?.code) {
      whereCondition.code = { $regex: qs.code, $options: 'i' }
    }
    if (qs?.name) {
      whereCondition.name = { $regex: qs.name, $options: 'i' }
    }

    // Lấy dữ liệu và đêmns tổng số bản ghi
    const totalItem = await this.positionModel.countDocuments(whereCondition)
    const result = await this.positionModel.find(whereCondition)
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


  async update(id: string, updatePositionDto: UpdatePositionDto) {
    const updatePosition = await this.positionModel.findByIdAndUpdate(id, updatePositionDto)
    if (!updatePosition) {
      throw new NotFoundException('Không tìm thấy chức danh')
    }
    return {
      message: "Cập nhập chức danh thành công",
      id: id,
      updatePosition
    }
  }

  async remove(id: string) {
    const deletePosition = await this.positionModel.findByIdAndDelete(id)
    if (!deletePosition) {
      throw new NotFoundException('Không tìm thấ chức danh')
    }
    return {
      message: 'Xóa chức danh thành công',
      id: id,
      deletePosition
    }
  }
}
