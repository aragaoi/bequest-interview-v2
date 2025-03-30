import { Module } from '@nestjs/common';
import { WillController } from './will.controller';
import { WillService } from './will.service';
import { Will } from './will.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Will])],
  controllers: [WillController],
  providers: [WillService],
  exports: [WillService],
})
export class WillModule {}
