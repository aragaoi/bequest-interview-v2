import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const DOCX_EXTENSION = '.docx';

interface Clause {
  id: string;
  title: string;
  content: Buffer;
}

@Injectable()
export class ClausesRepository {
  private readonly clausesPath: string;

  constructor() {
    this.clausesPath = path.join(
      process.cwd(),
      'apps',
      'backend',
      'src',
      'assets',
      'Clauses'
    );
  }

  async findAll(): Promise<Clause[]> {
    try {
      const files = fs.readdirSync(this.clausesPath);
      return files
        .filter((file) => file.endsWith(DOCX_EXTENSION))
        .map((file) => ({
          id: file,
          title: this.toProperCase(file.replace(DOCX_EXTENSION, '')),
          content: fs.readFileSync(path.join(this.clausesPath, file)),
        }));
    } catch (error) {
      console.error('Error reading clauses:', error);
      return [];
    }
  }

  private toProperCase(str: string): string {
    return str.split(/(?=[A-Z])/).join(' ');
  }
}
