import { ENV } from '../../utils/env-detect';
import type { SeverityLevel } from '../../../../shared/types/api.types';

interface ArchComponent {
  id: string;
  code: string;
  label: string;
}

interface Step3ContextProps {
  severity: SeverityLevel | null;
  severityLevels?: SeverityLevel[];
  onSeveritySelect: (s: SeverityLevel) => void;
  archComponent: ArchComponent | null;
  onArchComponentSelect: (c: ArchComponent) => void;
  affectedUrl: string;
  onAffectedUrlChange: (url: string) => void;
  expectedBehavior: string;
  onExpectedBehaviorChange: (val: string) => void;
  actualBehavior: string;
  onActualBehaviorChange: (val: string) => void;
  reproduced: string;
  onReproducedSelect: (val: 'always' | 'sometimes' | 'never' | '') => void;
  isBugType: boolean;
}

const SEVERITY_META: Record<string, { emoji: string; description: string }> = {
  P0: { emoji: '🔴', description: 'Hệ thống không dùng được' },
  P1: { emoji: '🟠', description: 'Tính năng chính bị lỗi' },
  P2: { emoji: '🟡', description: 'Bug nhỏ, có cách khác' },
  P3: { emoji: '🟢', description: 'Cải thiện, không gấp' },
};

const FALLBACK_SEVERITIES: SeverityLevel[] = [
  { id: 'p0', code: 'P0', label: 'Khẩn cấp',      sla_hours: 2,   sort_order: 1, color_hex: '#DC2626' },
  { id: 'p1', code: 'P1', label: 'Cao',            sla_hours: 8,   sort_order: 2, color_hex: '#F97316' },
  { id: 'p2', code: 'P2', label: 'Bình thường',    sla_hours: 72,  sort_order: 3, color_hex: '#EAB308' },
  { id: 'p3', code: 'P3', label: 'Thấp',           sla_hours: 168, sort_order: 4, color_hex: '#22C55E' },
];

const ARCH_COMPONENTS: ArchComponent[] = [
  { id: 'c1', code: 'nquoc_vn',      label: 'nquoc.vn' },
  { id: 'c2', code: 'team_nquoc_vn', label: 'team.nquoc.vn' },
  { id: 'c3', code: 'data_nquoc_vn', label: 'data.nquoc.vn' },
  { id: 'c4', code: 'api_nquoc_vn',  label: 'api.nquoc.vn' },
  { id: 'c5', code: 'supabase',      label: 'Supabase' },
  { id: 'c6', code: 'tbot_nquoc_vn', label: 'tbot.nquoc.vn' },
  { id: 'c7', code: 'external',      label: 'External' },
  { id: 'c8', code: 'unknown',       label: 'Không rõ' },
];

const ARCH_EMOJIS: Record<string, string> = {
  nquoc_vn: '🌐',
  team_nquoc_vn: '🏢',
  data_nquoc_vn: '📊',
  api_nquoc_vn: '⚙️',
  supabase: '🗄️',
  tbot_nquoc_vn: '🤖',
  external: '🔗',
  unknown: '❓',
};

const REPRO_OPTIONS: { label: string; value: 'always' | 'sometimes' | 'never' | '' }[] = [
  { label: '100%',       value: 'always' },
  { label: '~50%',       value: 'sometimes' },
  { label: '1 lần',      value: 'never' },
  { label: 'Chưa thử',   value: '' },
];

export default function Step3Context({
  severity,
  severityLevels,
  onSeveritySelect,
  archComponent,
  onArchComponentSelect,
  affectedUrl,
  onAffectedUrlChange,
  expectedBehavior,
  onExpectedBehaviorChange,
  actualBehavior,
  onActualBehaviorChange,
  reproduced,
  onReproducedSelect,
  isBugType,
}: Step3ContextProps) {
  const sevs = severityLevels?.length ? severityLevels : FALLBACK_SEVERITIES;

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Playfair_Display',serif]">
          Mô tả chi tiết hơn
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Càng chi tiết, IT càng xử lý nhanh cho bạn.
        </p>
      </div>

      {/* Severity */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Vấn đề nghiêm trọng cỡ nào?</h3>
          <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Cần điền</span>
        </div>
        <div id="sev-grid" className="grid grid-cols-2 gap-3">
          {sevs.map((sev) => {
            const isSelected = severity?.code === sev.code;
            const meta = SEVERITY_META[sev.code] ?? { emoji: '⚪', description: '' };
            return (
              <button
                key={sev.code}
                type="button"
                onClick={() => onSeveritySelect(sev)}
                className={`flex flex-col gap-1.5 rounded-xl p-4 text-left cursor-pointer transition-all duration-150
                  ${isSelected
                    ? 'border-2 shadow-[0_0_16px_rgba(0,0,0,0.3)]'
                    : 'border border-[var(--border-default)] bg-[var(--bg-card)] hover:border-opacity-60 hover:-translate-y-[1px]'
                  }`}
                style={isSelected ? { borderColor: sev.color_hex, backgroundColor: `${sev.color_hex}10` } : undefined}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{meta.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: sev.color_hex }}>{sev.code}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{sev.label}</span>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{meta.description}</span>
                <span
                  className="inline-block self-start text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1"
                  style={{ backgroundColor: `${sev.color_hex}20`, color: sev.color_hex }}
                >
                  IT xử lý trong {sev.sla_hours < 24 ? `${sev.sla_hours} giờ` : `${sev.sla_hours / 24} ngày`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* URL */}
      {isBugType && (
        <div className="space-y-2">
          <label htmlFor="url-field" className="block text-sm font-semibold text-[var(--text-primary)]">
            Link trang đang bị lỗi
          </label>
          <input
            id="url-field"
            type="text"
            value={affectedUrl}
            onChange={(e) => onAffectedUrlChange(e.target.value)}
            placeholder="https://nquoc.vn/..."
            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] outline-none transition-colors focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30"
          />
        </div>
      )}

      {/* Architecture Component */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Hệ thống nào đang bị lỗi?</h3>
          <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Cần điền</span>
        </div>
        <div id="arch-grid" className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
          {ARCH_COMPONENTS.map((comp) => {
            const isSelected = archComponent?.code === comp.code;
            const emoji = ARCH_EMOJIS[comp.code] ?? '❓';
            return (
              <button
                key={comp.code}
                type="button"
                onClick={() => onArchComponentSelect(comp)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left cursor-pointer transition-all duration-150 text-xs font-medium
                  ${isSelected
                    ? 'border-2 border-[#7C3AED] bg-[var(--color-primary-bg)] text-violet-200'
                    : 'border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[#7C3AED]/60'
                  }`}
              >
                <span className="text-base leading-none">{emoji}</span>
                <span className="truncate">{comp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expected / Actual */}
      {isBugType && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Bạn kỳ vọng gì và thực tế ra sao?</h3>
            <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Cần điền</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#22C55E]">
                <span>✅</span><span>Kỳ vọng</span>
              </div>
              <textarea
                id="expected-field"
                value={expectedBehavior}
                onChange={(e) => onExpectedBehaviorChange(e.target.value)}
                placeholder="Hệ thống nên hoạt động như thế nào..."
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] outline-none transition-colors focus:border-[#22C55E]/60 focus:ring-1 focus:ring-[#22C55E]/20 resize-none"
                style={{ minHeight: '70px' }}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
                <span>❌</span><span>Thực tế</span>
              </div>
              <textarea
                id="actual-field"
                value={actualBehavior}
                onChange={(e) => onActualBehaviorChange(e.target.value)}
                placeholder="Thực tế đang xảy ra điều gì..."
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] outline-none transition-colors focus:border-[#DC2626]/60 focus:ring-1 focus:ring-[#DC2626]/20 resize-none"
                style={{ minHeight: '70px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reproducibility */}
      {isBugType && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Lỗi này có xảy ra thường xuyên không?
            <span className="ml-2 text-[10px] font-normal text-[var(--text-secondary)]">Không bắt buộc</span>
          </h3>
          <div id="repro-row" className="flex flex-wrap gap-2">
            {REPRO_OPTIONS.map((opt) => {
              const isSelected = reproduced === opt.value;
              return (
                <button
                  key={opt.value || '__empty'}
                  type="button"
                  onClick={() => onReproducedSelect(opt.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-all duration-150
                    ${isSelected
                      ? 'border-2 border-[#7C3AED] bg-[var(--color-primary-bg)] text-violet-200'
                      : 'border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[#7C3AED]/60 hover:text-[var(--text-primary)]'
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Environment */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Môi trường
          <span className="ml-2 text-[10px] font-normal text-[var(--text-dim)]">Tự động phát hiện</span>
        </h3>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs text-[var(--text-secondary)]">
          <span>{ENV.browser}</span>
          <span className="text-[var(--border-default)]">·</span>
          <span>{ENV.os}</span>
          <span className="text-[var(--border-default)]">·</span>
          <span>{ENV.screen}</span>
        </div>
      </div>
    </section>
  );
}
