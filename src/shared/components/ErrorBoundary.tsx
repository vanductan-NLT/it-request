import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090F] flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-[#0F1219] border border-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-900/30 border border-red-800 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Đã xảy ra lỗi
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Ứng dụng gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-4 p-3 rounded-lg bg-gray-900 border border-gray-700 text-left">
                  <p className="text-xs text-red-400 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Thử lại
                </button>
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
                >
                  Tải lại trang
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
