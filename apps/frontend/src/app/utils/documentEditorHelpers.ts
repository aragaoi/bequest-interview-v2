import {
  DocumentEditor,
  SectionBreakType,
} from '@syncfusion/ej2-documenteditor';
import { getWill, saveWill } from '../api/willApi';
import {
  CURRENT_OFFSET_LOCAL_STORAGE_KEY,
  DOCUMENT_MIME_TYPE,
} from '../constants';
import { Clause, Document } from '../types';
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
  if (!documentEditor) return;

  const { editor, selection } = documentEditor;

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
  id: number,
  documentEditor?: DocumentEditor
): Promise<Document | null> => {
  if (!documentEditor) return null;

  try {
    const will = await getWill(id);
    const file = new File([will.blob], 'document.docx', {
      type: DOCUMENT_MIME_TYPE,
    });
    documentEditor.open(file);
    return will;
  } catch (error) {
    console.error('Error opening document:', error);
    return null;
  }
};

export const reloadDocumentInEditor = async (
  id?: number,
  documentEditor?: DocumentEditor
) => {
  if (!documentEditor) return null;

  try {
    const savedDocument = await saveDocument(documentEditor, id);
    return openDocumentFromServer(id ?? savedDocument.id, documentEditor);
  } catch (error) {
    console.error('Error reloading document:', error);
    return null;
  }
};

export const saveDocument = async (
  documentEditor: DocumentEditor,
  id?: number
): Promise<Document> => {
  try {
    const content = await documentEditor.saveAsBlob('Docx');
    const file = new File([content], 'document.docx', {
      type: DOCUMENT_MIME_TYPE,
    });

    const document = await saveWill(file, id);
    return document;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
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
  if (!editor?.selection) return;

  const currentOffset = localStorage.getItem(CURRENT_OFFSET_LOCAL_STORAGE_KEY);
  if (currentOffset && currentOffset.indexOf('-1') === -1) {
    try {
      editor.selection.select(currentOffset, currentOffset);
    } catch (error) {
      console.error('Error resetting cursor:', error);
    } finally {
      localStorage.removeItem(CURRENT_OFFSET_LOCAL_STORAGE_KEY);
    }
  }
};
