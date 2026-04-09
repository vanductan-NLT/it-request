import type { RequestType } from '../../../../shared/types/api.types';

const REQUEST_TYPE_EMOJIS: Record<string, string> = {
  bug_report: '🐛',
  login_access: '🔐',
  feature: '✨',
  performance: '🐌',
  data_issue: '📊',
};

const REQUEST_TYPE_DESCRIPTIONS: Record<string, string> = {
  bug_report: 'Hệ thống bị lỗi, không hoạt động đúng',
  login_access: 'Không đăng nhập được hoặc thiếu quyền',
  feature: 'Yêu cầu tính năng mới cho hệ thống',
  performance: 'Hệ thống chậm, load lâu',
  data_issue: 'Dữ liệu sai, mất hoặc không đồng bộ',
};

interface Step2RequestTypeProps {
  requestTypes: RequestType[];
  selectedType: RequestType | null;
  onSelect: (rt: RequestType) => void;
}

export default function Step2RequestType({ requestTypes, selectedType, onSelect }: Step2RequestTypeProps) {
  return (
    <section className="space-y-5">
      {/* Section heading */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Playfair_Display',serif]">
          Bạn đang gặp vấn đề gì?
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Chọn mô tả gần nhất với tình huống của bạn.
        </p>
      </div>

      {/* Request type list */}
      <div id="reqtype-grid" className="flex flex-col gap-3">
        {requestTypes.map((rt) => {
          const isSelected = selectedType?.id === rt.id;
          const emoji = REQUEST_TYPE_EMOJIS[rt.code] ?? '📋';
          const description = REQUEST_TYPE_DESCRIPTIONS[rt.code] ?? '';

          return (
            <button
              key={rt.id}
              type="button"
              onClick={() => onSelect(rt)}
              className={`
                relative flex items-center gap-4 rounded-lg px-5 py-4 text-left cursor-pointer
                transition-all duration-150
                ${
                  isSelected
                    ? 'border-2 border-[#7C3AED] bg-[var(--color-primary-bg)] shadow-[0_0_16px_rgba(124,58,237,0.15)]'
                    : 'border border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[#7C3AED]/60 hover:-translate-y-[1px]'
                }
              `}
            >
              {/* Emoji */}
              <span className="text-2xl leading-none flex-shrink-0">{emoji}</span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-medium ${isSelected ? 'text-violet-200' : 'text-[var(--text-primary)]'}`}>
                  {rt.label}
                </span>
                {description && (
                  <span className="block text-xs text-[var(--text-secondary)] mt-0.5">{description}</span>
                )}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
