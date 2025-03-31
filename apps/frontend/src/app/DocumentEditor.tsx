import { registerLicense } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import {
  ContainerContentChangeEventArgs,
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';
import '@syncfusion/ej2-react-documenteditor/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AUTO_SAVE_DEBOUNCE_TIMEOUT_MS,
  DEFAULT_DOCUMENT_NAME,
  DOCUMENT_EDITOR_SERVICE_URL,
  SYNCFUSION_LICENSE_KEY,
} from './constants';
import { DocumentSidebar } from './DocumentSidebar';
import { Document } from './types';
import {
  downloadDocument,
  openDocumentFromServer,
  reloadDocumentInEditor,
  resetCursor,
  saveCursorPositionAfterBookmark,
  saveDocument,
} from './utils/documentEditorHelpers';

DocumentEditorContainerComponent.Inject(Toolbar);
registerLicense(SYNCFUSION_LICENSE_KEY);

export const DocumentEditor = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<DocumentEditorContainerComponent>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [isOpeningNewFile, setIsOpeningNewFile] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const navigate = useNavigate();
  const { id: idParam } = useParams();

  const id = useMemo(() => (idParam ? Number(idParam) : undefined), [idParam]);

  const updateBookmarksList = useCallback(() => {
    if (!editorRef.current) return;
    const currentBookmarks =
      editorRef.current.documentEditor?.getBookmarks() || [];
    setBookmarks(currentBookmarks);
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    updateBookmarksList();
  }, [updateBookmarksList]);

  const reloadDocument = useCallback(async () => {
    const reloadedDocument = await reloadDocumentInEditor(
      id,
      editorRef.current?.documentEditor
    );

    if (reloadedDocument) {
      setDocument(reloadedDocument);
    }
  }, [id, editorRef]);

  const openFile = useCallback((file?: File | Blob) => {
    if (!file) return;
    const editor = editorRef.current!.documentEditor;
    editor.open(file);
    setIsOpeningNewFile(false);
  }, []);

  const resetDocumentState = useCallback(() => {
    navigate('/', { replace: true });
    setDocument(null);
  }, [navigate]);

  useEffect(() => {
    if (id && (!document || document.id !== Number(id)) && !isOpeningNewFile) {
      openDocumentFromServer(id, editorRef.current?.documentEditor).then(
        setDocument
      );
    }
  }, [id, document, isOpeningNewFile]);

  const handleOpen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target.files?.[0];
    if (!fileInput) return;

    setIsOpeningNewFile(true);
    resetDocumentState();
    openFile(fileInput);
  };

  const handleDownload = async () => {
    const editor = editorRef.current!.documentEditor;

    await downloadDocument(DEFAULT_DOCUMENT_NAME, editor);
  };

  const handleClauseAdded = useCallback(
    async (bookmark: string) => {
      await reloadDocument();

      const editor = editorRef.current!.documentEditor;
      saveCursorPositionAfterBookmark(editor, bookmark);
    },
    [editorRef, reloadDocument]
  );

  const saveFile = useCallback(async () => {
    const editor = editorRef.current!.documentEditor;
    const savedDocument = await saveDocument(editor, id);

    if (savedDocument) {
      setDocument(savedDocument);
      navigate(`/document/${savedDocument.id}`, { replace: true });
    }
  }, [id, navigate]);

  const debouncedSaveFile = useCallback(
    debounce(async () => {
      await saveFile();
    }, AUTO_SAVE_DEBOUNCE_TIMEOUT_MS),
    [saveFile]
  );

  const handleContentChange = useCallback(() => {
    debouncedSaveFile();
    updateBookmarksList();
  }, [debouncedSaveFile, updateBookmarksList]);

  const handleDocumentChange = useCallback(
    (e: ContainerContentChangeEventArgs) => {
      if (!e?.source) return;

      const currentOffset = e.source.documentEditor.selection.startOffset;
      e.source.documentEditor.selection.selectAll();
      const selectedContent = e.source.documentEditor.selection.text;
      e.source.documentEditor.selection.select(currentOffset, currentOffset);

      if (selectedContent.trim() === '') return;

      resetCursor(e.source.documentEditor);

      debouncedSaveFile();
      updateBookmarksList();
    },
    [debouncedSaveFile, updateBookmarksList]
  );

  return (
    <>
      <div
        id="document-editor"
        className="px-4 md:px-24 bg-gray-300 pt-12 h-screen"
      >
        <div className="flex justify-end space-x-4 mb-4">
          <button
            className="bg-gray-500 text-white py-2 px-4 rounded"
            onClick={() => fileInputRef.current?.click()}
          >
            Open
          </button>
          <input
            type="file"
            accept=".docx"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleOpen}
          />
          <button
            className="bg-gray-500 text-white py-2 px-4 rounded"
            onClick={handleDownload}
          >
            Download
          </button>
        </div>
        <div className="flex flex-row">
          <div className="w-3/4">
            <DocumentEditorContainerComponent
              height="calc(100vh - 200px)"
              serviceUrl={DOCUMENT_EDITOR_SERVICE_URL}
              enableToolbar={true}
              showPropertiesPane={false}
              ref={editorRef}
              toolbarItems={[
                'New',
                'Open',
                'Separator',
                'Undo',
                'Redo',
                'Separator',
                'Bookmark',
                'Table',
                'Separator',
                'Find',
              ]}
              contentChange={handleContentChange}
              documentChange={handleDocumentChange}
            />
          </div>
          <div className="w-1/4 mt-4 mt-0">
            {editorRef && (
              <DocumentSidebar
                editorRef={
                  editorRef as React.RefObject<DocumentEditorContainerComponent>
                }
                onClauseAdded={handleClauseAdded}
                bookmarks={bookmarks}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

