import type { Team, RequestType, SeverityLevel } from '@/shared/types/api.types';

interface SuccessPageProps {
  ticketId: string;
  team: Team;
  requestType: RequestType;
  severity: SeverityLevel;
  slaHours: number;
  fileCount: number;
  createdAt: string;
  itBrief: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onNew: () => void;
}

function formatSla(hours: number): string {
  if (hours < 24) return `${hours} giờ`;
  return `${hours / 24} ngày`;
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function SuccessPage({
  ticketId,
  team,
  requestType,
  severity,
  slaHours,
  fileCount,
  createdAt,
  itBrief: _itBrief,
  onEdit,
  onDelete,
  onNew,
}: SuccessPageProps) {
  function handleDelete() {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xoá yêu cầu này? Hành động này không thể hoàn tác.',
    );
    if (confirmed) {
      onDelete();
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Success icon */}
        <div className="text-center">
          <div
            className="inline-block text-[64px] leading-none"
            style={{
              animation: 'bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            ✅
          </div>
          <h1 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">
            Yêu cầu đã được gửi!
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Ticket #{ticketId.slice(0, 8)}
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                Team
              </p>
              <p className="text-sm text-[var(--text-primary)]">{team.label}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                Loại
              </p>
              <p className="text-sm text-[var(--text-primary)]">{requestType.label}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                Mức độ
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: severity.color_hex }}
                >
                  {severity.code}
                </span>
                <span className="text-sm text-[var(--text-primary)]">{severity.label}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                SLA
              </p>
              <p className="text-sm text-[var(--text-primary)]">{formatSla(slaHours)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                File đính kèm
              </p>
              <p className="text-sm text-[var(--text-primary)]">{fileCount} file</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider mb-0.5">
                Gửi lúc
              </p>
              <p className="text-sm text-[var(--text-primary)]">
                {formatTimestamp(createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Next steps panel */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
          <h3 className="text-sm font-medium text-green-400 mb-3">
            Bước tiếp theo
          </h3>
          <ol className="space-y-2.5">
            {[
              'IT xác nhận đã nhận qua Telegram',
              'IT nhắn nếu cần thêm thông tin',
              'IT báo đã sửa xong',
              'Bạn kiểm tra và phản hồi OK',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">{text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 py-2.5 border border-[var(--border-default)] hover:border-[var(--text-dim)] rounded-lg text-sm text-[var(--text-primary)] transition-colors"
          >
            ✏️ Chỉnh sửa
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 py-2.5 border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5 rounded-lg text-sm text-red-400 transition-colors"
          >
            🗑️ Xoá yêu cầu
          </button>
          <button
            type="button"
            onClick={onNew}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium text-white transition-colors"
          >
            + Gửi yêu cầu mới
          </button>
        </div>

        {/* Keyframe style */}
        <style>{`
          @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.3); }
            50% { opacity: 1; transform: scale(1.05); }
            70% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
