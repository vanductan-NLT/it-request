import type { StepId } from '../../state/wizard.types';

const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: 'Team' },
  { id: 2, label: 'Loại' },
  { id: 3, label: 'Chi tiết' },
  { id: 4, label: 'Phỏng vấn' },
  { id: 5, label: 'Gửi' },
];

interface WizardTimelineProps {
  currentStep: StepId;
  onStepClick: (step: StepId) => void;
  canGoFn: (step: StepId) => boolean;
}

export function WizardTimeline({
  currentStep,
  onStepClick,
  canGoFn,
}: WizardTimelineProps) {
  return (
    <div className="sticky top-14 z-30 h-12 bg-[var(--bg-surface)] border-b border-[var(--border-default)] flex items-center justify-center px-4 overflow-x-auto">
      <div className="flex items-center gap-0 min-w-max">
        {STEPS.map((step, idx) => {
          const isDone = step.id < currentStep && canGoFn(step.id);
          const isActive = step.id === currentStep;
          const isLocked = step.id > currentStep;
          const clickable = isDone;

          return (
            <div key={step.id} className="flex items-center">
              {/* Connecting line before dot (skip first) */}
              {idx > 0 && (
                <div
                  className={`w-8 sm:w-12 h-[2px] ${
                    step.id <= currentStep
                      ? 'bg-[#7C3AED]/50'
                      : 'bg-[var(--border-default)]'
                  }`}
                />
              )}

              {/* Dot + label group */}
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(step.id)}
                className={`flex flex-col items-center gap-1 group ${
                  clickable ? 'cursor-pointer' : 'cursor-default'
                }`}
                title={step.label}
              >
                {/* Dot */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200
                    ${
                      isDone
                        ? 'bg-[#22C55E] text-white'
                        : isActive
                          ? 'bg-[#7C3AED] text-white animate-pulse shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                          : 'bg-[var(--border-default)] text-[var(--text-dim)]'
                    }
                    ${clickable ? 'hover:ring-2 hover:ring-[#7C3AED]/40' : ''}
                  `}
                >
                  {isDone ? (
                    <svg
                      className="w-3.5 h-3.5"
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
                  ) : (
                    step.id
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] leading-none whitespace-nowrap ${
                    isDone
                      ? 'text-[#22C55E]'
                      : isActive
                        ? 'text-[#7C3AED] font-medium'
                        : isLocked
                          ? 'text-[var(--border-light)]'
                          : 'text-[var(--text-dim)]'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
