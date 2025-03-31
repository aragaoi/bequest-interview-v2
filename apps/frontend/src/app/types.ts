export type Document = {
  id: number;
  mimeType: string;
  size: number;
  buffer: string;
};

export interface Clause {
  id: string;
  title: string;
  content: string;
} 