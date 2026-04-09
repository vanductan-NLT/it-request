import { ThemeToggle } from '@/shared/components/ThemeToggle';

export function WizardHeader() {
  return (
    <header className="sticky top-0 z-40 h-14 bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-[30px] h-[30px] rounded-lg bg-[#7C3AED] flex items-center justify-center text-white text-[15px] font-bold shrink-0">
          N
        </div>
        <div>
          <div className="text-sm font-bold text-[var(--text-primary)] leading-tight">
            NQuoc IT Request
          </div>
          <div className="text-[10px] text-[var(--text-dim)] leading-tight">
            Hệ thống tiếp nhận yêu cầu IT
          </div>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
