import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendancesService } from './attendances.service.js';
import { AttendancesController } from './attendances.controller.js';
import { Attendance, AttendanceSchema } from './entities/attendance.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
  exports: [MongooseModule],
})
export class AttendancesModule {}
