import type { WizardState } from '../state/wizard.types';

/**
 * Check if current request type is a bug-like type (not feature).
 * Feature types don't require Expected/Actual fields.
 */
function isBugType(state: WizardState): boolean {
  return state.requestType !== null && !state.requestType.code.includes('feature');
}

/**
 * Calculate completeness score 0-100 based on wizard state.
 *
 * Weights:
 *   team selected:          +8
 *   requestType selected:   +8
 *   severity selected:      +12
 *   archComponent:          +8
 *   expectedBehavior > 5:   +9  (auto-filled for non-bug types)
 *   actualBehavior > 5:     +9  (auto-filled for non-bug types)
 *   reproduced selected:    +5
 *   questions answered:     (answeredCount / total) * 18
 *   files uploaded > 0:     +15
 *   Total max:              100 (8+8+12+8+9+9+5+18+15 = 92, but non-bug gets +18 for E/A = 100)
 *
 * Note: For non-bug types, E/A contributes +18 automatically since those fields
 * are not relevant, keeping the max achievable at 100.
 */
export function calcScore(state: WizardState): number {
  let score = 0;

  // Team: +8
  if (state.team) score += 8;

  // Request type: +8
  if (state.requestType) score += 8;

  // Severity: +12
  if (state.severity) score += 12;

  // Arch component: +8
  if (state.archComponent) score += 8;

  // Expected/Actual behavior: +9 each
  if (isBugType(state)) {
    if (state.expectedBehavior.trim().length > 5) score += 9;
    if (state.actualBehavior.trim().length > 5) score += 9;
  } else {
    // Non-bug types: E/A auto-counts as filled
    score += 18;
  }

  // Reproduced: +5
  if (state.reproduced !== '') score += 5;

  // Interview questions: (answered / total) * 18
  if (state.requestType && state.requestType.interview_questions.length > 0) {
    const total = state.requestType.interview_questions.length;
    const answered = state.requestType.interview_questions.filter(
      (q) => state.answers[q.id] && state.answers[q.id].trim().length > 0
    ).length;
    score += Math.round((answered / total) * 18);
  } else {
    // No questions defined: full credit
    score += 18;
  }

  // Files uploaded: +15
  const totalFiles = Object.keys(state.slotFiles).length + state.extraFiles.length;
  if (totalFiles > 0) score += 15;

  return Math.min(score, 100);
}

/**
 * Get color hex for the score bar.
 * 0-49: red, 50-74: yellow, 75-100: green
 */
export function scoreColor(score: number): string {
  if (score < 50) return '#DC2626';
  if (score < 75) return '#EAB308';
  return '#22C55E';
}

/**
 * Get label for the score status.
 */
export function scoreLabel(score: number): string {
  if (score < 50) return 'Cần thêm thông tin';
  if (score < 75) return 'Gần đủ';
  return 'Đủ để IT xử lý ngay ✓';
}
