import { DocumentEditor } from '@syncfusion/ej2-documenteditor';
import { useCallback, useEffect, useState } from 'react';
import { fetchClauses } from './api/clausesApi';
import { ClauseDialog } from './ClauseDialog';
import { AddClauseButton } from './components/AddClauseButton';
import { Clause } from './types';
import { insertClause, removeClause } from './utils/documentEditorHelpers';
import { DocumentEditorContainerComponent } from '@syncfusion/ej2-react-documenteditor';

interface DocumentSidebarProps {
  editorRef: React.RefObject<DocumentEditorContainerComponent>;
  onClauseAdded?: (bookmark: string) => Promise<void>;
  bookmarks: string[];
}

export const DocumentSidebar = ({
  editorRef,
  onClauseAdded,
  bookmarks,
}: DocumentSidebarProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [availableClauses, setAvailableClauses] = useState<Clause[]>([]);

  const handleAddClause = async (bookmark?: string, atStart?: boolean) => {
    const documentEditor = editorRef.current?.documentEditor;

    if (documentEditor) {
      if (bookmark) {
        documentEditor.selection.selectBookmark(bookmark);
        documentEditor.selection.moveToLineEnd();
      }

      if (atStart) {
        documentEditor.selection.moveToDocumentStart();
      }
    }

    const clauses = await fetchClauses();
    setAvailableClauses(clauses);
    setShowDialog(true);
  };

  const handleCloseDialog = useCallback(() => {
    const documentEditor = editorRef.current?.documentEditor;

    setShowDialog(false);
    setTimeout(() => {
      documentEditor?.focusIn();
    }, 100);
  }, [editorRef]);

  const handleSelectClause = async (clause: Clause) => {
    if (!editorRef.current) return;

    const documentEditor = editorRef.current.documentEditor;

    const newBookmark = insertClause(documentEditor, clause);

    if (!newBookmark) return;

    await onClauseAdded?.(newBookmark);
  };

  const handleRemoveClause = (bookmark: string) => {
    if (!editorRef.current) return;

    const documentEditor = editorRef.current.documentEditor;

    removeClause(documentEditor, bookmark);
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
                  editorRef.current?.documentEditor.selection.selectBookmark(
                    bookmark
                  );
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
