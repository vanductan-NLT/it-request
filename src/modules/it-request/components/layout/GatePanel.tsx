import type { GateItem } from '../../state/wizard.types';

interface GatePanelProps {
  step: number;
  gates: GateItem[];
  canProceed: boolean;
  onNext: () => void;
  onBack?: () => void;
  onScrollToMissing: (targetId: string) => void;
}

export function GatePanel({
  step: _step,
  gates,
  canProceed,
  onNext,
  onBack,
  onScrollToMissing,
}: GatePanelProps) {
  const missingRequired = gates.filter((g) => g.required && !g.ok);
  const missingCount = missingRequired.length;

  return (
    <div className="sticky bottom-0 z-30 bg-[var(--bg-surface)] border-t border-[var(--border-default)] px-5 py-3 space-y-2">
      {/* Gate checklist */}
      {gates.length > 0 && (
        <div>
          <div className="text-[11px] text-[var(--text-muted)] font-medium mb-1.5">
            Cần hoàn tất
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {gates.map((gate) => (
              <button
                key={gate.id}
                type="button"
                disabled={gate.ok}
                onClick={() => !gate.ok && onScrollToMissing(gate.targetId)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  gate.ok
                    ? 'text-[#22C55E] cursor-default'
                    : gate.required
                      ? 'text-[#EAB308] cursor-pointer hover:text-[#FACC15] animate-pulse'
                      : 'text-[var(--text-dim)] cursor-pointer hover:text-[var(--text-muted)]'
                }`}
              >
                {/* Icon */}
                {gate.ok ? (
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : gate.required ? (
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[var(--border-light)] shrink-0" />
                )}
                <span>{gate.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--border-light)] rounded-lg transition-colors"
          >
            &larr; Quay lại
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onNext}
          className={`relative px-5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            canProceed
              ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[0_0_16px_rgba(124,58,237,0.3)]'
              : 'bg-[var(--border-default)] text-[var(--text-dim)] cursor-not-allowed'
          }`}
        >
          Tiếp &rarr;
          {!canProceed && missingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#EAB308] text-[var(--bg-page)] text-[9px] font-bold rounded-full flex items-center justify-center">
              {missingCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
