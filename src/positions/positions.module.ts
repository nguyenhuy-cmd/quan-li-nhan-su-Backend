import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionsService } from './positions.service.js';
import { PositionsController } from './positions.controller.js';
import { Position, PositionSchema } from './entities/position.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Position.name, schema: PositionSchema }]),
  ],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [MongooseModule],
})
export class PositionsModule {}
