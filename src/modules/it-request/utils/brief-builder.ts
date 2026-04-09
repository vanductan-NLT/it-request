import type { WizardState } from '../state/wizard.types';
import { calcScore } from './score';
import { ENV } from './env-detect';

const REPRODUCED_LABELS: Record<string, string> = {
  always: 'Luôn luôn',
  sometimes: 'Thỉnh thoảng',
  never: 'Không',
  '': 'Không rõ',
};

/**
 * Build the IT Brief text for Telegram copy-paste.
 * This is used as a fallback if the backend brief is not available yet.
 */
export function buildBrief(state: WizardState): string {
  const severity = state.severity ? `[${state.severity.code}] ` : '';
  const reqLabel = state.requestType?.label ?? '';
  const teamLabel = state.team?.label ?? '';
  const score = calcScore(state);
  const reproLabel = REPRODUCED_LABELS[state.reproduced] ?? 'Không rõ';

  const submitterLine = state.submitterName
    ? state.submitterTg
      ? `${state.submitterName} (${state.submitterTg})`
      : state.submitterName
    : 'Chưa điền';

  const lines: string[] = [];

  // Header
  lines.push(`\uD83D\uDEA8 ${severity}${reqLabel} \u2014 ${teamLabel}`);
  lines.push(`\uD83D\uDC64 ${submitterLine}`);

  if (state.affectedUrl) {
    lines.push(`\uD83D\uDD17 ${state.affectedUrl}`);
  }

  lines.push(`\uD83D\uDCCA Completeness: ${score}% | Tái diễn: ${reproLabel}`);

  // Problem description
  lines.push('');
  if (state.actualBehavior) {
    lines.push(`\u274C Thực tế: ${state.actualBehavior}`);
  }
  if (state.expectedBehavior) {
    lines.push(`\u2705 Kỳ vọng: ${state.expectedBehavior}`);
  }

  // Interview answers
  if (state.requestType && state.requestType.interview_questions.length > 0) {
    const answeredQuestions = state.requestType.interview_questions.filter(
      (q) => state.answers[q.id] && state.answers[q.id].trim().length > 0
    );

    if (answeredQuestions.length > 0) {
      lines.push('');
      lines.push('\uD83D\uDCAC Phỏng vấn:');
      for (const q of answeredQuestions) {
        lines.push(`Q: ${q.question}`);
        lines.push(`A: ${state.answers[q.id]}`);
        lines.push('');
      }
    }
  }

  // Environment
  lines.push(`\uD83D\uDDA5\uFE0F ${ENV.browser} / ${ENV.os} / ${ENV.screen}`);

  return lines.join('\n').trim();
}
