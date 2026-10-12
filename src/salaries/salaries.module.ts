import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalariesService } from './salaries.service.js';
import { SalariesController } from './salaries.controller.js';
import { Salary, SalarySchema } from './entities/salary.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Salary.name, schema: SalarySchema }]),
  ],
  controllers: [SalariesController],
  providers: [SalariesService],
  exports: [MongooseModule],
})
export class SalariesModule {}
