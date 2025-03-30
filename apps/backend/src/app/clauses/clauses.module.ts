import { Module } from '@nestjs/common';
import { ClausesController } from './clauses.controller';
import { ClausesService } from './clauses.service';
import { ClausesRepository } from './clauses.repository';

@Module({
  controllers: [ClausesController],
  providers: [ClausesService, ClausesRepository],
  exports: [ClausesService],
})
export class ClausesModule {}
