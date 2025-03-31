import {
  DocumentEditor,
  SectionBreakType,
} from '@syncfusion/ej2-documenteditor';
import { getWill, saveWill } from '../api/willApi';
import { Clause, Document } from '../types';
import {
  DOCUMENT_MIME_TYPE,
  CURRENT_OFFSET_LOCAL_STORAGE_KEY,
} from '../constants';
import { set } from 'lodash';
const generateUniqueBookmarkName = (
  existingBookmarks: string[],
  baseTitle: string
) => {
  let bookmarkName = baseTitle;
  let counter = 1;

  while (existingBookmarks.includes(bookmarkName)) {
    bookmarkName = `${baseTitle} (${counter})`;
    counter++;
  }

  return bookmarkName;
};

export const insertClause = (
  documentEditor: DocumentEditor | undefined,
  clause: Clause
) => {
  const { editor, selection } = documentEditor ?? {};
  if (!editor || !selection || !documentEditor) return;

  const existingBookmarks = documentEditor.getBookmarks() || [];
  const bookmarkName = generateUniqueBookmarkName(
    existingBookmarks,
    clause.title
  );

  editor.insertSectionBreak(SectionBreakType.Continuous);

  const startOffset: string = selection.startOffset;
  let endOffset;

  editor.insertText(`${clause.content}`);
  selection.moveToLineEnd();
  endOffset = selection.endOffset;

  selection.select(startOffset, endOffset);
  editor.insertBookmark(bookmarkName);

  // clear the selection
  selection.select(endOffset, endOffset);

  // add a new line after the bookmark
  selection.moveToLineEnd();
  editor.insertSectionBreak(SectionBreakType.Continuous);

  return bookmarkName;
};

export const removeClause = (
  documentEditor: DocumentEditor | undefined,
  bookmark: string
) => {
  if (!documentEditor) return;

  documentEditor.selection.selectBookmark(bookmark, false);
  documentEditor.editor.delete();
  documentEditor.editor.deleteBookmark(bookmark);
};

export const openDocumentFromServer = async (
  id: string,
  documentEditor?: DocumentEditor
) => {
  if (!documentEditor) return null;

  try {
    const document = await getWill(id);
    const file = new File([document.blob], 'document.docx', {
      type: DOCUMENT_MIME_TYPE,
    });
    documentEditor.open(file);
    return document;
  } catch (error) {
    console.error('Error opening document:', error);
    return null;
  }
};

export const reloadDocumentInEditor = async (
  id: string,
  documentEditor?: DocumentEditor
) => {
  if (!documentEditor || !id) return null;

  try {
    await saveDocument(documentEditor, id);
    return await openDocumentFromServer(id, documentEditor);
  } catch (error) {
    console.error('Error reloading document:', error);
    return null;
  }
};

export const saveDocument = async (
  documentEditor: DocumentEditor,
  id?: string
): Promise<Document | null> => {
  try {
    const content = await documentEditor.saveAsBlob('Docx');
    const file = new File([content], 'document.docx', {
      type: DOCUMENT_MIME_TYPE,
    });

    const document = await saveWill(file, id);
    return document;
  } catch (error) {
    console.error('Error saving document:', error);
    return null;
  }
};

export const downloadDocument = async (
  fileName: string,
  documentEditor: DocumentEditor
) => {
  try {
    const content = await documentEditor.saveAsBlob('Docx');

    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading document:', error);
  }
};

export const saveCursorPositionAfterBookmark = (
  editor: DocumentEditor,
  bookmark: string
) => {
  editor.selection.selectBookmark(bookmark);
  editor.selection.moveToNextLine();
  localStorage.setItem(
    CURRENT_OFFSET_LOCAL_STORAGE_KEY,
    editor.selection.startOffset
  );
};

export const resetCursor = (editor: DocumentEditor) => {
  const currentOffset = localStorage.getItem(CURRENT_OFFSET_LOCAL_STORAGE_KEY);
  if (currentOffset && currentOffset.indexOf('-1') === -1) {
    editor.selection.select(currentOffset, currentOffset);
    localStorage.removeItem(CURRENT_OFFSET_LOCAL_STORAGE_KEY);
  }
};
