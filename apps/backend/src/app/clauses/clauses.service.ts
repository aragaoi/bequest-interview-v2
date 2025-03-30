import { Injectable } from '@nestjs/common';
import { ClausesRepository } from './clauses.repository';
import { DOMParser } from 'xmldom';
import AdmZip from 'adm-zip';

@Injectable()
export class ClausesService {
  private readonly parser: DOMParser;

  constructor(private readonly clausesRepository: ClausesRepository) {
    this.parser = new DOMParser();
  }

  async findAll() {
    const clauses = await this.clausesRepository.findAll();

    return clauses.map((clause) => ({
      ...clause,
      content: this.convertBufferToString(clause.content),
    }));
  }

  private convertBufferToString(buffer: Buffer): string {
    const zip = new AdmZip(buffer);
    const documentXml = zip.getEntry('word/document.xml');

    if (!documentXml) {
      throw new Error('No document.xml found in docx file');
    }

    const doc = this.parser.parseFromString(
      documentXml.getData().toString('utf8'),
      'text/xml'
    );

    const paragraphs = doc.getElementsByTagName('w:p');
    return Array.from(paragraphs)
      .map((p) => {
        const texts = p.getElementsByTagName('w:t');
        return Array.from(texts)
          .map((t) => t.textContent)
          .join('');
      })
      .join('\n');
  }
}
