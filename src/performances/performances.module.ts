import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformancesService } from './performances.service.js';
import { PerformancesController } from './performances.controller.js';
import {
  Performance,
  PerformanceSchema,
} from './entities/performance.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Performance.name, schema: PerformanceSchema },
    ]),
  ],
  controllers: [PerformancesController],
  providers: [PerformancesService],
  exports: [MongooseModule],
})
export class PerformancesModule {}
