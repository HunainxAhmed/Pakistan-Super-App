import { Module } from '@nestjs/common';
import { BargainingService } from './bargaining.service';
import { BargainingController } from './bargaining.controller';

@Module({
  controllers: [BargainingController],
  providers: [BargainingService],
  exports: [BargainingService],
})
export class BargainingModule {}
