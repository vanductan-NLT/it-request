import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './shared/lib/query-client';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { AuthGuard } from './shared/components/AuthGuard';
import { ToastContainer } from './shared/components/Toast';
import { AppRouter } from './router';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          <AppRouter />
        </AuthGuard>
        <ToastContainer />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
