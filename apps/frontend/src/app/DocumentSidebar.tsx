import { DocumentEditor } from '@syncfusion/ej2-documenteditor';
import { DocumentEditorContainerComponent } from '@syncfusion/ej2-react-documenteditor';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClauseDialog } from './ClauseDialog';
import { AddClauseButton } from './components/AddClauseButton';
import { Clause } from './types';
import { insertClause, removeClause } from './utils/documentEditorHelpers';
import { fetchClauses } from './api/clausesApi';

interface DocumentSidebarProps {
  editorRef: RefObject<DocumentEditorContainerComponent | null>;
  onClauseAdded?: () => void;
}

export const DocumentSidebar = ({
  editorRef,
  onClauseAdded,
}: DocumentSidebarProps) => {
  const documentEditor = editorRef.current?.documentEditor as DocumentEditor;
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [availableClauses, setAvailableClauses] = useState<Clause[]>([]);
  const { id } = useParams();

  const updateBookmarksList = useCallback(() => {
    if (!documentEditor) return;
    const currentBookmarks = documentEditor.getBookmarks() || [];
    setBookmarks(currentBookmarks);
  }, [documentEditor]);

  useEffect(() => {
    if (!documentEditor) return;

    updateBookmarksList();

    const originalContentChange = documentEditor.contentChange;
    const originalDocumentChange = documentEditor.documentChange;

    documentEditor.contentChange = () => {
      updateBookmarksList();
      if (originalContentChange) {
        originalContentChange();
      }
    };

    documentEditor.documentChange = () => {
      updateBookmarksList();
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
  }, [documentEditor, updateBookmarksList]);

  const handleAddClause = async (bookmark?: string, atStart?: boolean) => {
    if (!documentEditor) return;

    if (bookmark) {
      documentEditor.selection.selectBookmark(bookmark);
      documentEditor.selection.moveToLineEnd();
    }

    if (atStart) {
      documentEditor.selection.moveToLineStart();
    }

    const clauses = await fetchClauses();
    setAvailableClauses(clauses);
    setShowDialog(true);
  };

  const handleCloseDialog = useCallback(() => {
    setShowDialog(false);
    setTimeout(() => {
      documentEditor.focusIn();
    }, 100);
  }, [documentEditor]);

  const handleSelectClause = async (clause: Clause) => {
    if (!documentEditor || !id) return;
    const newBookmark = insertClause(documentEditor, clause);
    if (!newBookmark) return;

    onClauseAdded?.();
  };

  const handleRemoveClause = (bookmark: string) => {
    if (!documentEditor) return;
    removeClause(documentEditor, bookmark);
    setBookmarks((prevBookmarks) =>
      prevBookmarks.filter((b) => b !== bookmark)
    );
  };

  return (
    <div className="h-full bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Clauses</h2>
        <AddClauseButton
          onClick={() => handleAddClause()}
          title="Add clause at current position"
          variant="text"
          text="Add Clause"
        />
      </div>
      <div className="space-y-1 h-[calc(100%-3rem)] overflow-y-auto">
        <AddClauseButton
          onClick={() => handleAddClause(undefined, true)}
          title="Add clause at the beginning"
          variant="text"
          text="Add Clause at Start"
        />
        {bookmarks.map((bookmark: string, index) => (
          <div key={bookmark} className="group space-y-1">
            <div className="flex justify-between items-center px-3 py-1.5 hover:bg-blue-50 rounded-md transition-colors bg-blue-50 border border-blue-100">
              <span
                className="cursor-pointer flex-grow text-sm text-blue-700 hover:text-blue-800 transition-colors"
                onClick={() => {
                  documentEditor.selection.selectBookmark(bookmark);
                }}
              >
                {bookmark}
              </span>
              <button
                onClick={() => handleRemoveClause(bookmark)}
                className="text-gray-400 hover:text-red-500 transition-all text-xs py-0.5 px-1.5"
                title="Remove clause"
              >
                ✕
              </button>
            </div>
            {index === bookmarks.length - 1 ? (
              <AddClauseButton
                onClick={() => handleAddClause(bookmark)}
                title="Add clause at the end"
                variant="text"
                text="Add Clause at End"
              />
            ) : (
              <AddClauseButton
                onClick={() => handleAddClause(bookmark)}
                title="Add clause after this one"
              />
            )}
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
