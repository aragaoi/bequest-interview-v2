import * as fs from 'fs';
import * as path from 'path';

const DOCX_EXTENSION = '.docx';

export interface Clause {
  id: number;
  title: string;
  content: Buffer;
}

export class ClausesRepository {
  private readonly clausesPath = path.join(
    process.cwd(),
    'apps',
    'backend',
    'src',
    'assets',
    'Clauses'
  );

  findAll(): Clause[] {
    try {
      const files = fs.readdirSync(this.clausesPath);
      return files
        .filter((file) => file.endsWith(DOCX_EXTENSION))
        .map((file, index) => {
          const content = fs.readFileSync(path.join(this.clausesPath, file));
          return {
            id: index + 1,
            title: file.replace(DOCX_EXTENSION, ''),
            content,
          };
        });
    } catch (error) {
      console.error('Error reading clauses:', error);
      return [];
    }
  }
}
