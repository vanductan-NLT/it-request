interface ScoreBarProps {
  score: number;
  scoreColor: string;
  scoreLabel: string;
}

export function ScoreBar({ score, scoreColor, scoreLabel }: ScoreBarProps) {
  return (
    <div className="sticky top-[104px] z-20 bg-[#0D1117] border-b border-[#1F2937] px-5 py-2 flex items-center gap-3">
      <span className="text-[11px] text-[#6B7280] whitespace-nowrap shrink-0">
        Độ đầy đủ:
      </span>

      {/* Progress bar track */}
      <div className="flex-1 h-1 bg-[#1F2937] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, score))}%`,
            backgroundColor: scoreColor,
          }}
        />
      </div>

      {/* Percentage + label */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="text-xs font-semibold tabular-nums"
          style={{ color: scoreColor }}
        >
          {score}%
        </span>
        <span className="text-[10px] text-[#6B7280]">{scoreLabel}</span>
      </div>
    </div>
  );
}
