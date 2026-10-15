import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavesService } from './leaves.service.js';
import { LeavesController } from './leaves.controller.js';
import { Leave, LeavesSchema } from './entities/leaves.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Leave.name, schema: LeavesSchema }]),
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [MongooseModule],
})
export class LeavesModule { }
