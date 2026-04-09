export function WizardHeader() {
  return (
    <header className="sticky top-0 z-40 h-14 bg-[#0D1117] border-b border-[#1F2937] px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-[30px] h-[30px] rounded-lg bg-[#7C3AED] flex items-center justify-center text-white text-[15px] font-bold shrink-0">
          N
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-tight">
            NQuoc IT Request
          </div>
          <div className="text-[10px] text-[#4B5563] leading-tight">
            Hệ thống tiếp nhận yêu cầu IT
          </div>
        </div>
      </div>
    </header>
  );
}
