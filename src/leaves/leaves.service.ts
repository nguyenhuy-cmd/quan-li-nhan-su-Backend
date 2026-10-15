import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto.js';
import { UpdateLeafDto } from './dto/update-leaf.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Leave } from './entities/leaves.entity.js';
import { Model } from 'mongoose';
import { ApproveLeaveDto } from './dto/approve-leave.dto.js';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(Leave.name)
    private readonly leavesModel: Model<Leave>,
  ) { }
  async create(createLeaveDto: CreateLeaveDto) {
    const newLeave = new this.leavesModel(createLeaveDto)
    return await newLeave.save()
  }

  async findAll(currentPage: string, limit: string, qs: any) {
    const page = parseInt(currentPage) || 1;
    const defaultLimit = parseInt(limit) || 10;

    const skip = (page - 1) * defaultLimit;

    const whereCondition: any = {};
    if (qs?.employeeId) {
      whereCondition.employeeId = qs.employeeId
    }
    if (qs?.type) {
      whereCondition.type = { $regex: qs.type, $options: 'i' }
    }
    if (qs?.status) {
      whereCondition.status = qs.status
    }

    const totalItem = await this.leavesModel.countDocuments(whereCondition)
    const result = await this.leavesModel.find(whereCondition)
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
      },
      result
    }
  }

  async findOne(id: string) {
    const leaver = await this.leavesModel.findById(id);
    if (!leaver) {
      throw new NotFoundException('Không tìm thấy đơn xin nghỉ này')
    }
    return {
      id: id,
      leaver
    }
  }

  async update(id: string, approveLeaveDto: ApproveLeaveDto) {
    const { status, reviewedBy, reason } = approveLeaveDto;

    // Tìm đơn nghỉ phép theo id
    const leaveRequest = await this.leavesModel.findById(id)
    if (!leaveRequest) {
      throw new NotFoundException('Không tìm thấy đơn xin nghỉ');
    }

    // Kiểm tra: nếu đơn hàng đc xử lý trước đó:
    if (leaveRequest.status !== 'pending') {
      throw new BadRequestException(
        `Đơn hàng đã được xử lý trước đó: ${leaveRequest.status}`
      );
    }

    // Cập nhập thông tin
    leaveRequest.status = status;
    leaveRequest.reviewedBy = reviewedBy as any;

    if (reason) {
      leaveRequest.reason = leaveRequest.reason
        ? `${leaveRequest.reason} | Ghi chú người duyệt ${reason}`
        : `Ghi chú người duyệt ${reason}`
    }
    return await leaveRequest.save();
  }

}
