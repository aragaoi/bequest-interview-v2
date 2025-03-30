import { Controller, Get } from '@nestjs/common';
import { ClausesService } from './clauses.service';

@Controller('clauses')
export class ClausesController {
  constructor(private readonly clausesService: ClausesService) {}

  @Get()
  findAll() {
    return this.clausesService.findAll();
  }
}
