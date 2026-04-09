import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from './LoginPage';

interface AuthGuardProps {
  children: ReactNode;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#07090F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">
          Đang tải...
        </p>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading } = useAuth();

  // Bypass auth in development mode with placeholder credentials
  const isDev = import.meta.env.DEV || import.meta.env.VITE_ENV === 'development';
  if (isDev) {
    return <>{children}</>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
