import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ITRequestPage } from './modules/it-request/ITRequestPage';
import { NotFoundPage } from './shared/components/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ITRequestPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
