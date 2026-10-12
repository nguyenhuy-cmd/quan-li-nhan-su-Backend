import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavesService } from './leaves.service.js';
import { LeavesController } from './leaves.controller.js';
import { Leaf, LeafSchema } from './entities/leaf.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Leaf.name, schema: LeafSchema }]),
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [MongooseModule],
})
export class LeavesModule {}
