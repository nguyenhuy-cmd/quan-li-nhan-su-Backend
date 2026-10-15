import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance } from './entities/attendance.entity.js';
import { Model } from 'mongoose';
import { CheckInDto } from './dto/check-in.dto.js';
import { CheckOutDto } from './dto/check-out.dto.js';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>
  ) { }

  // Lấy thời gian đầu ngày(00.00.00)
  private getStatusOfDay(date: Date = new Date()): Date {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0);
    return start
  }

  async checkIn(checkInDto: CheckInDto) {
    const { employeeId, note } = checkInDto;
    const now = new Date();
    const today = this.getStatusOfDay(now);

    // Kiểm tra hôm nay nhân viên đã check in chưa
    const exAttendance = await this.attendanceModel.findOne({
      employtoda: employeeId,
      data: today
    })
    if (exAttendance) {
      throw new ConflictException('Bạn đã chấm công')
    }

    // Logic tính trạng thái bắt đầu làm
    const workStartTime = new Date(today);
    workStartTime.setHours(8, 30, 0, 0)
    const status = now > workStartTime ? 'late' : 'present';

    // Tạo bản ghi chấm công mới
    const attendance = new this.attendanceModel({
      employeeId: employeeId,
      date: today,
      checkIn: now,
      status,
      note: note
    })
    return await attendance.save()
  }

  async checkOut(checkOutDto: CheckOutDto) {
    const { employeeId, note } = checkOutDto;
    const now = new Date();
    const today = this.getStatusOfDay(now);

    // Tìm bản ghi chấm công hôm nay của nhân viên
    const exAttendance = await this.attendanceModel.findOne({
      employtoda: employeeId,
      data: today
    })
    if (!exAttendance) {
      throw new ConflictException('Bạn chưa chấm công')
    }

    // ĐÃ checkOut hôm nay
    if (exAttendance.checkOut) {
      throw new ConflictException('Bạn đã checkout hôm nay')
    }

    // Cập nhập checkout và ghi chú nếu có
    exAttendance.checkOut = now;
    if (note) {
      exAttendance.note = exAttendance.note
        ? `${exAttendance.note} | Check out: ${note}`
        : note
    }
    return await exAttendance.save()
  }

  async findOne(id: string) {
    const exAttendance = await this.attendanceModel.findById(id);
    if (!exAttendance) {
      throw new NotFoundException('Không tìm thấy thông tin chấm lương của nhân viên này')
    }
    return {
      id: id,
      exAttendance
    }
  }
}
