import { Injectable } from '@nestjs/common';
import { ClausesRepository, Clause } from './clauses.repository';

@Injectable()
export class ClausesService {
  constructor(private readonly clausesRepository: ClausesRepository) {}

  findAll(): Clause[] {
    return this.clausesRepository.findAll();
  }
}
