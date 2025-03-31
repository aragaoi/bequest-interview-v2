import { DocumentEditorContainerComponent } from '@syncfusion/ej2-react-documenteditor';
import {
  DocumentEditor,
  SectionBreakType,
} from '@syncfusion/ej2-documenteditor';
import { RefObject, useState, useEffect, useCallback, use } from 'react';
import { ClauseDialog } from './ClauseDialog';
import axios from 'axios';

interface DocumentSidebarProps {
  editorRef: RefObject<DocumentEditorContainerComponent | null>;
}

interface Clause {
  id: string;
  title: string;
  content: string;
}

const CLAUSES_BASE_URL = 'http://localhost:3000/api/clauses';

export const DocumentSidebar = ({ editorRef }: DocumentSidebarProps) => {
  const documentEditor = editorRef.current?.documentEditor as DocumentEditor;
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [availableClauses, setAvailableClauses] = useState<Clause[]>([]);

  const generateUniqueBookmarkName = useCallback(
    (baseTitle: string) => {
      let bookmarkName = baseTitle;
      let counter = 1;
      const existingBookmarks = documentEditor?.getBookmarks() || [];

      while (existingBookmarks.includes(bookmarkName)) {
        bookmarkName = `${baseTitle} (${counter})`;
        counter++;
      }

      return bookmarkName;
    },
    [documentEditor]
  );

  const updateBookmarks = useCallback(() => {
    const currentBookmarks = documentEditor?.getBookmarks() || [];
    setBookmarks(currentBookmarks);
  }, [documentEditor]);

  useEffect(() => {
    if (!documentEditor) return;

    updateBookmarks();

    const originalContentChange = documentEditor.contentChange;
    const originalDocumentChange = documentEditor.documentChange;

    documentEditor.contentChange = () => {
      updateBookmarks();
      if (originalContentChange) {
        originalContentChange();
      }
    };

    documentEditor.documentChange = () => {
      updateBookmarks();
      if (originalDocumentChange) {
        originalDocumentChange();
      }
    };

    // Cleanup
    return () => {
      if (originalContentChange) {
        documentEditor.contentChange = originalContentChange;
      }
    };
  }, [documentEditor, updateBookmarks]);

  const fetchClauses = useCallback(async () => {
    try {
      const response = await axios.get(CLAUSES_BASE_URL);
      setAvailableClauses(response.data);
    } catch (error) {
      console.error('Error fetching clauses:', error);
    }
  }, []);

  const handleAddClause = () => {
    fetchClauses();
    setShowDialog(true);
  };

  const handleSelectClause = async (clause: Clause) => {
    const { editor, selection } = documentEditor ?? {};
    if (!editor) return;

    editor.insertSectionBreak(SectionBreakType.Continuous);

    const startOffset: string = selection.startOffset;
    let endOffset;

    editor.insertText(`${clause.content}`);
    selection.moveToLineEnd();
    endOffset = selection.endOffset;

    const bookmarkName = generateUniqueBookmarkName(clause.title);

    selection.select(startOffset, endOffset);
    editor.insertBookmark(bookmarkName);

    // clear the selection
    selection.select(endOffset, endOffset);

    // add a new line after the bookmark
    selection.moveToLineEnd();
    editor.insertSectionBreak(SectionBreakType.Continuous);
  };

  const handleRemoveClause = (bookmark: string) => {
    if (!documentEditor) return;

    documentEditor.selection.selectBookmark(bookmark, false);

    documentEditor.editor.delete();
    documentEditor.editor.deleteBookmark(bookmark);
  };

  const handleCloseDialog = useCallback(() => {
    setShowDialog(false);
    setTimeout(() => {
      documentEditor.focusIn();
    }, 100);
  }, [documentEditor]);

  return (
    <div className="h-full bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Clauses</h2>
        <button
          onClick={handleAddClause}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Add Clause
        </button>
      </div>
      <div className="space-y-2 h-[calc(100%-3rem)] overflow-y-auto">
        {bookmarks.map((bookmark: string) => (
          <div
            key={bookmark}
            className="flex justify-between items-center p-2 hover:bg-gray-100 rounded"
          >
            <span
              className="cursor-pointer flex-grow"
              onClick={() => {
                documentEditor.selection.selectBookmark(bookmark);
              }}
            >
              {bookmark}
            </span>
            <button
              onClick={() => handleRemoveClause(bookmark)}
              className="text-red-500 hover:text-red-700"
              title="Remove clause"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <ClauseDialog
        visible={showDialog}
        onClose={handleCloseDialog}
        onSelect={handleSelectClause}
        clauses={availableClauses}
      />
    </div>
  );
};
