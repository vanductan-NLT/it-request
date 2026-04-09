import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

async function bootstrap() {
  // Start MSW in development mode
  if (import.meta.env.DEV || import.meta.env.VITE_ENV === 'development') {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        quiet: true,
      });
    } catch (e) {
      console.warn('MSW failed to start:', e);
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
