import type { WizardState } from '../state/wizard.types';
import { ENV } from './env-detect';

const MAX_FIELD_LENGTH = 500;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

const REPRODUCED_LABELS: Record<string, string> = {
  always: 'Luôn luôn (100%)',
  sometimes: 'Thỉnh thoảng (~50%)',
  never: 'Không tái diễn',
  '': 'Không rõ',
};

/**
 * Build a structured Claude prompt from wizard state.
 * The user will copy-paste this into claude.ai to generate
 * a User Story + IT Checklist.
 */
export function buildPrompt(state: WizardState): string {
  const severityLine = state.severity
    ? `${state.severity.code} - ${state.severity.label} (SLA: ${state.severity.sla_hours}h)`
    : 'Chưa chọn';

  const componentLine = state.archComponent?.label ?? 'Chưa chọn';
  const urlLine = state.affectedUrl || 'Không có';
  const expectedLine = truncate(state.expectedBehavior || 'Không có', MAX_FIELD_LENGTH);
  const actualLine = truncate(state.actualBehavior || 'Không có', MAX_FIELD_LENGTH);
  const reproducedLine = REPRODUCED_LABELS[state.reproduced] ?? 'Không rõ';

  // Build interview answers section
  let interviewSection = 'Không có câu hỏi phỏng vấn.';
  if (state.requestType && state.requestType.interview_questions.length > 0) {
    const qaPairs = state.requestType.interview_questions
      .filter((q) => state.answers[q.id] && state.answers[q.id].trim().length > 0)
      .map((q) => `Q: ${q.question}\nA: ${state.answers[q.id]}`);

    if (qaPairs.length > 0) {
      interviewSection = qaPairs.join('\n\n');
    } else {
      interviewSection = 'Chưa trả lời câu hỏi nào.';
    }
  }

  return `Bạn là System Analyst của NQuoc Platform (NhiLe Holdings).
NQuoc Platform là Work OS nội bộ với các portal:
nquoc.vn | team.nquoc.vn | data.nquoc.vn | api.nquoc.vn | tbot.nquoc.vn

--- THÔNG TIN YÊU CẦU ---
Team: ${state.team?.label ?? 'Chưa chọn'}
Loại: ${state.requestType?.label ?? 'Chưa chọn'}
Mức độ: ${severityLine}
Component: ${componentLine}
URL đang lỗi: ${urlLine}

--- MÔ TẢ VẤN ĐỀ ---
Kỳ vọng: ${expectedLine}
Thực tế: ${actualLine}
Tái diễn: ${reproducedLine}

--- TRẢ LỜI PHỎNG VẤN ---
${interviewSection}

--- MÔI TRƯỜNG ---
${ENV.browser} / ${ENV.os} / ${ENV.screen}

--- YÊU CẦU ---
1. Viết User Story theo format "As a... I want... So that..."
2. Liệt kê 5-8 bước IT cần kiểm tra để debug (debug checklist)
3. Đề xuất mức độ phức tạp: Dễ / Trung bình / Khó và lý do tại sao`;
}
