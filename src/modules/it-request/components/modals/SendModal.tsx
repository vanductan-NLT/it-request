import { useState } from 'react';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  score: number;
  briefText: string;
  fileCount: number;
}

export default function SendModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  score,
  briefText,
  fileCount,
}: SendModalProps) {
  const [expanded, setExpanded] = useState(false);

  if (!isOpen) return null;

  const statusColor =
    score >= 75 ? 'green' : score >= 50 ? 'amber' : 'red';

  const statusLabel =
    score >= 75
      ? '✅ Đủ thông tin'
      : score >= 50
        ? '⚠️ Gần đủ'
        : '❌ Chưa đủ';

  const statusEmoji =
    score >= 75 ? '>' : score >= 50 ? '~' : '!';

  const truncatedBrief =
    !expanded && briefText
      ? briefText.split('\n').slice(0, 3).join('\n') +
        (briefText.split('\n').length > 3 ? '\n...' : '')
      : briefText;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[580px] max-h-[88vh] overflow-y-auto bg-[#0D1117] border border-[#1F2937] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
          <h2 className="text-base font-semibold text-[#F9FAFB]">
            Gửi cho IT Team
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#1F2937] flex items-center justify-center transition-colors"
          >
            <span className="text-[#9CA3AF] text-lg leading-none">x</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">
          {/* Status card */}
          <div
            className={`rounded-lg px-4 py-3 flex items-center gap-3 ${
              statusColor === 'green'
                ? 'bg-green-500/10 border border-green-500/30'
                : statusColor === 'amber'
                  ? 'bg-amber-500/10 border border-amber-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            <span className="text-xl" aria-hidden="true">
              {statusColor === 'green' ? '✅' : statusColor === 'amber' ? '⚠️' : '❌'}
            </span>
            <div>
              <p
                className={`text-sm font-medium ${
                  statusColor === 'green'
                    ? 'text-green-400'
                    : statusColor === 'amber'
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
              >
                {statusLabel}
              </p>
              <p className="text-[11px] text-[#9CA3AF]">
                Độ đầy đủ: {score}%
              </p>
            </div>
          </div>

          {/* Brief preview */}
          {briefText && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">
                Tóm tắt cho IT
              </h3>
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
                <pre className="text-xs text-[#9CA3AF] font-mono whitespace-pre-wrap leading-relaxed">
                  {truncatedBrief}
                </pre>
                {briefText.split('\n').length > 3 && (
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {expanded ? 'Thu gọn' : 'Xem thêm...'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* File count */}
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2">
            <span className="text-base">📎</span>
            <span className="text-xs text-[#9CA3AF]">
              {fileCount} file đính kèm
            </span>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang gửi...
              </>
            ) : (
              '✓ Đã gửi xong'
            )}
          </button>

          {/* Cancel link */}
          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            >
              Huỷ bỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
