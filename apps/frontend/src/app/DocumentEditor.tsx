import { registerLicense } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';
import '@syncfusion/ej2-react-documenteditor/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Document } from './types';
import { debounce } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentSidebar } from './DocumentSidebar';

DocumentEditorContainerComponent.Inject(Toolbar);
registerLicense(
  'Ngo9BigBOggjHTQxAR8/V1NMaF1cXmhNYVJ2WmFZfVtgdV9DZVZUTGYuP1ZhSXxWdkZiWH9fdXJVR2BaWEE='
);

const AUTO_SAVE_DEBOUNCE_TIMEOUT_MS = 1000;
const WILL_BASE_URL = 'http://localhost:3000/api/will';

const willClient = axios.create({
  baseURL: WILL_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const DocumentEditor = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<DocumentEditorContainerComponent>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const openFile = useCallback((file?: File | Blob) => {
    if (!file) return;
    const editor = editorRef.current!.documentEditor;
    editor.open(file);
  }, []);

  const resetDocumentState = useCallback(() => {
    setDocument(null);
    navigate('/', { replace: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [navigate]);

  useEffect(() => {
    if (id && (!document || document.id !== Number(id))) {
      willClient.get(`/${id}`, { responseType: 'blob' }).then((response) => {
        const file = new File([response.data], 'Document.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        openFile(file);
        setDocument({
          id: Number(id),
          mimeType: response.data.type,
          size: response.data.size,
          buffer: '',
        });
      });
    }
  }, [id, document, openFile]);

  const handleOpen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target.files?.[0];
    if (!fileInput) return;

    resetDocumentState();
    openFile(fileInput);
  };

  const handleDownload = async () => {
    const editor = editorRef.current!.documentEditor;
    const blob = await editor.saveAsBlob('Docx');

    const file = new File([blob], `Document.docx`, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    downloadFile(file);
  };

  const saveFile = useCallback(async () => {
    const editor = editorRef.current!.documentEditor;

    const blob = await editor.saveAsBlob('Docx');
    const file = new File([blob], `Document.docx`, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    if (id) {
      await willClient.put(`/${id}`, {
        file,
      });
    } else {
      const response = await willClient.post('', {
        file,
      });
      setDocument(response.data);
      navigate(`/document/${response.data.id}`, { replace: true });
    }
  }, [id, navigate]);

  useEffect(() => {
    const editor = editorRef.current!.documentEditor;
    editor.documentEditorSettings.showBookmarks = true;

    const debouncedSaveFile = debounce(async () => {
      await saveFile();
    }, AUTO_SAVE_DEBOUNCE_TIMEOUT_MS);

    editor.contentChange = () => {
      console.log('Document Content changed');
      debouncedSaveFile();
    };
    editor.documentChange = () => {
      console.log('Document changed');
      debouncedSaveFile();
    };
  }, [saveFile]);

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
              serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
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
              contentChange={(e) => {}}
            />
          </div>
          <div className="w-1/4 mt-4 mt-0">
            {editorRef && <DocumentSidebar editorRef={editorRef} />}
          </div>
        </div>
      </div>
    </>
  );
};

const downloadFile = (file: File) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
};
