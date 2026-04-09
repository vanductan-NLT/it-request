export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--text-muted)] mb-4 font-['Playfair_Display',serif]">
          404
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mb-6">
          Trang bạn tìm không tồn tại
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
