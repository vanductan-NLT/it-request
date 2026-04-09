import type { Team } from '../../../../shared/types/api.types';

const TEAM_EMOJIS: Record<string, string> = {
  n_edu: '🎓',
  bloom: '🌸',
  this_is_home: '🏠',
  family_cloud: '☁️',
  nhi_le_system: '⚙️',
  nquoc: '🚀',
};

interface Step1TeamProps {
  teams: Team[];
  selectedTeam: Team | null;
  onSelect: (team: Team) => void;
}

export default function Step1Team({ teams, selectedTeam, onSelect }: Step1TeamProps) {
  return (
    <section className="space-y-5">
      {/* Section heading */}
      <div>
        <h2 className="text-xl font-bold text-[#F9FAFB] font-['Playfair_Display',serif]">
          Bạn thuộc team nào?
        </h2>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Chọn team bạn đang làm việc hoặc team liên quan đến vấn đề.
        </p>
      </div>

      {/* Team grid */}
      <div
        id="team-grid"
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))' }}
      >
        {teams.map((team) => {
          const isSelected = selectedTeam?.id === team.id;
          const emoji = TEAM_EMOJIS[team.code] ?? team.label.charAt(0).toUpperCase();

          return (
            <button
              key={team.id}
              type="button"
              onClick={() => onSelect(team)}
              className={`
                relative flex flex-col items-center gap-2 rounded-xl p-5 cursor-pointer
                transition-all duration-150 text-center
                ${
                  isSelected
                    ? 'border-2 border-[#7C3AED] bg-[#1C1535] shadow-[0_0_16px_rgba(124,58,237,0.15)]'
                    : 'border border-[#1F2937] bg-[#111827] hover:border-[#7C3AED]/60 hover:-translate-y-[1px]'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}

              {/* Emoji */}
              <span className="text-3xl leading-none">{emoji}</span>

              {/* Label */}
              <span className={`text-sm font-medium ${isSelected ? 'text-violet-200' : 'text-[#F9FAFB]'}`}>
                {team.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
