import { DocumentEditor } from './DocumentEditor';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocumentEditor />} />
        <Route path="/document/:id" element={<DocumentEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
