import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePerformanceDto } from './dto/create-performance.dto.js';
import { UpdatePerformanceDto } from './dto/update-performance.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Performance } from './entities/performance.entity.js';

@Injectable()
export class PerformancesService {
  constructor(
    @InjectModel(Performance.name)
    private readonly performanceModel: Model<Performance>
  ) { }
  async create(createPerformanceDto: CreatePerformanceDto) {
    const newDanhGia = new this.performanceModel(createPerformanceDto)
    return await newDanhGia.save()
  }

  async findOne(id: string) {
    const xemDanhGia = await this.performanceModel.findById(id)
    if (!xemDanhGia) {
      throw new NotFoundException(`Hiện tại không có đánh giá nào`)
    }
    return {
      id: id,
      xemDanhGia
    }
  }
}
