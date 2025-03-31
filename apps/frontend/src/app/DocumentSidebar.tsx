import { DocumentEditorContainerComponent } from '@syncfusion/ej2-react-documenteditor';
import { DocumentEditor } from '@syncfusion/ej2-documenteditor';
import { RefObject, useState, useEffect, useCallback } from 'react';
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

  const updateBookmarks = useCallback(() => {
    const currentBookmarks = documentEditor?.getBookmarks() || [];
    setBookmarks(currentBookmarks);
  }, [documentEditor]);

  useEffect(() => {
    if (!documentEditor) return;

    updateBookmarks();

    const originalContentChange = documentEditor.contentChange;

    documentEditor.contentChange = () => {
      updateBookmarks();
      if (originalContentChange) {
        originalContentChange();
      }
    };

    // Cleanup
    return () => {
      if (originalContentChange) {
        documentEditor.contentChange = originalContentChange;
      }
    };
  }, [documentEditor, updateBookmarks]);

  const fetchClauses = async () => {
    try {
      const response = await axios.get(CLAUSES_BASE_URL);
      setAvailableClauses(response.data);
    } catch (error) {
      console.error('Error fetching clauses:', error);
    }
  };

  const handleAddClause = () => {
    fetchClauses();
    setShowDialog(true);
  };

  const handleSelectClause = async (clause: Clause) => {
    const { editor, selection } = documentEditor ?? {};
    if (!editor) return;

    const startOffset: string = selection.startOffset;
    let endOffset;

    editor.insertText(`\n${clause.content}`);

    endOffset = selection.endOffset;
    selection.select(startOffset, endOffset);
    editor.insertBookmark(clause.title);
    selection.select(endOffset, endOffset);
  };

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
            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => {
              documentEditor.selection.selectBookmark(bookmark);
            }}
          >
            {bookmark}
          </div>
        ))}
      </div>
      <ClauseDialog
        visible={showDialog}
        onClose={() => setShowDialog(false)}
        onSelect={handleSelectClause}
        clauses={availableClauses}
      />
    </div>
  );
};
