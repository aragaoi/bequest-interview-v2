import { Injectable } from '@nestjs/common';
import { ClausesRepository } from './clauses.repository';
import { DOMParser } from 'xmldom';
import AdmZip from 'adm-zip';

const NODE_TYPES = {
  TEXT: 3,
  ELEMENT: 1,
} as const;

const ELEMENT_TAGS = {
  PARAGRAPH: 'w:p',
  RUN: 'w:r',
  TEXT: 'w:t',
  BREAK: 'w:br',
  PARAGRAPH_PROPERTIES: 'w:pPr',
  PARAGRAPH_STYLE: 'w:pStyle',
  VALUE: 'w:val',
} as const;

const PARAGRAPH_STYLES = {
  RESOLUTION_2: 'bpLTSResolution2',
} as const;

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
    const zipFile = new AdmZip(buffer);

    const documentXmlFile = zipFile.getEntry('word/document.xml');
    if (!documentXmlFile) {
      throw new Error('No document.xml found in docx file');
    }

    const document = this.parser.parseFromString(
      documentXmlFile.getData().toString('utf8'),
      'text/xml'
    );

    const documentBody = document.getElementsByTagName('w:body')[0];
    if (!documentBody) {
      throw new Error('No body found in document');
    }

    return this.processBody(documentBody);
  }

  private processBody(documentBody: any): string {
    let result = '';
    let subListCounter = 0;
    Array.from(documentBody.childNodes).forEach((node) => {
      const [text, newCounter] = this.processNode(node, subListCounter);
      result += text;
      subListCounter = newCounter;
    });
    return result.trim();
  }

  private processNode(node: any, subListCounter: number): [string, number] {
    if (node.nodeType === NODE_TYPES.TEXT) {
      return [node.textContent, subListCounter];
    }

    if (node.nodeType === NODE_TYPES.ELEMENT) {
      switch (node.tagName) {
        case ELEMENT_TAGS.PARAGRAPH:
          return this.processParagraph(node, subListCounter);
        case ELEMENT_TAGS.RUN:
          return this.processRun(node, subListCounter);
        case ELEMENT_TAGS.TEXT:
          return [node.textContent, subListCounter];
        case ELEMENT_TAGS.BREAK:
          return [this.processBreak(node), subListCounter];
        default:
          return ['', subListCounter];
      }
    }

    return ['', subListCounter];
  }

  private processParagraph(
    node: any,
    subListCounter: number
  ): [string, number] {
    const style = this.getParagraphStyle(node);
    let result = '';
    let newCounter = subListCounter;

    if (style === PARAGRAPH_STYLES.RESOLUTION_2) {
      result = `${String.fromCharCode(97 + newCounter++)}. `;
    }

    Array.from(node.childNodes).forEach((child) => {
      const [text, counter] = this.processNode(child, newCounter);
      result += text;
      newCounter = counter;
    });

    if (!result.endsWith('\n')) {
      result += '\n';
    }

    return [result, newCounter];
  }

  private processRun(node: any, subListCounter: number): [string, number] {
    let result = '';
    let newCounter = subListCounter;
    Array.from(node.childNodes).forEach((child) => {
      const [text, counter] = this.processNode(child, newCounter);
      result += text;
      newCounter = counter;
    });
    return [result, newCounter];
  }

  private processBreak(node: any): string {
    return '\n';
  }

  private getParagraphStyle(node: any): string | null {
    const properties = node.getElementsByTagName(
      ELEMENT_TAGS.PARAGRAPH_PROPERTIES
    )[0];
    if (!properties) return null;

    const style = properties.getElementsByTagName(
      ELEMENT_TAGS.PARAGRAPH_STYLE
    )[0];
    if (!style) return null;

    return style.getAttribute(ELEMENT_TAGS.VALUE);
  }
}

