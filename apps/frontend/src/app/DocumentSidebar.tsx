import { DocumentEditorContainerComponent } from '@syncfusion/ej2-react-documenteditor';
import { DocumentEditor } from '@syncfusion/ej2-documenteditor';
import { RefObject, useState, useEffect, useCallback } from 'react';

interface DocumentSidebarProps {
  editorRef: RefObject<DocumentEditorContainerComponent | null>;
}

export const DocumentSidebar = ({ editorRef }: DocumentSidebarProps) => {
  const documentEditor = editorRef.current?.documentEditor as DocumentEditor;
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [clauseCount, setClauseCount] = useState<number>(0);

  const updateBookmarks = useCallback(() => {
    const currentBookmarks = documentEditor?.getBookmarks() || [];
    setBookmarks(currentBookmarks);
  }, [documentEditor]);

  useEffect(() => {
    if (!documentEditor) return;

    updateBookmarks();
    documentEditor.contentChange = updateBookmarks;
  }, [documentEditor, updateBookmarks]);

  const handleAddClause = () => {
    const { editor, selection } = documentEditor ?? {};
    if (!editor) return;

    const startOffset: string = selection.startOffset;
    let endOffset;

    const clauseText = `New Clause ${clauseCount + 1}\n\n`;
    setClauseCount(clauseCount + 1);

    editor.insertText(clauseText);

    endOffset = selection.endOffset;

    selection.select(startOffset, endOffset);

    editor.insertBookmark(clauseText);
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
    </div>
  );
};
