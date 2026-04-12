import type { WizardState, StepId, GateItem } from '../state/wizard.types';

/**
 * Check if current request type is a bug-like type (not feature).
 */
export function isBugType(state: WizardState): boolean {
  return state.requestType !== null && !state.requestType.code.includes('feature');
}

/**
 * Get gate items for a given step. Each gate item represents a requirement
 * that must be met before proceeding to the next step.
 */
export function getGate(state: WizardState, step?: StepId): GateItem[] {
  const currentStep = step ?? state.step;

  switch (currentStep) {
    case 1:
      return [
        {
          id: 'team',
          label: 'Chọn team',
          ok: state.team !== null,
          required: true,
          targetId: 'team-grid',
        },
      ];

    case 2:
      return [
        {
          id: 'reqType',
          label: 'Chọn loại vấn đề',
          ok: state.requestType !== null,
          required: true,
          targetId: 'reqtype-grid',
        },
      ];

    case 3: {
      const gates: GateItem[] = [
        {
          id: 'severity',
          label: 'Chọn mức độ',
          ok: state.severity !== null,
          required: true,
          targetId: 'severity-grid',
        },
        {
          id: 'archComponent',
          label: 'Chọn hệ thống bị lỗi',
          ok: state.archComponent !== null,
          required: true,
          targetId: 'component-grid',
        },
      ];

      if (isBugType(state)) {
        gates.push(
          {
            id: 'expectedBehavior',
            label: 'Mô tả kỳ vọng (>5 ký tự)',
            ok: state.expectedBehavior.trim().length > 5,
            required: true,
            targetId: 'expected-field',
          },
          {
            id: 'actualBehavior',
            label: 'Mô tả thực tế (>5 ký tự)',
            ok: state.actualBehavior.trim().length > 5,
            required: true,
            targetId: 'actual-field',
          }
        );
      }

      return gates;
    }

    case 4: {
      if (!state.requestType || state.requestType.interview_questions.length === 0) {
        return [];
      }
      const allAnswered = state.requestType.interview_questions.every(
        (q) => state.answers[q.id] && state.answers[q.id].trim().length > 0
      );
      return [
        {
          id: 'interview',
          label: 'Trả lời tất cả câu hỏi',
          ok: allAnswered,
          required: true,
          targetId: 'interview-section',
        },
      ];
    }

    case 5: {
      const totalFiles = Object.keys(state.slotFiles).length + state.extraFiles.length;
      return [
        {
          id: 'file',
          label: 'Đính kèm file (không bắt buộc)',
          ok: totalFiles > 0,
          required: false,
          targetId: 'upload-section',
        },
      ];
    }

    default:
      return [];
  }
}

/**
 * Check if the user can proceed past the given step.
 * All required gate items must be satisfied.
 */
export function canGo(state: WizardState, step?: StepId): boolean {
  const gates = getGate(state, step);
  return gates.filter((g) => g.required).every((g) => g.ok);
}

/**
 * Scroll to the first missing required gate item and apply a pulse animation.
 */
export function scrollToMissing(state: WizardState, step?: StepId): void {
  const gates = getGate(state, step);
  const missing = gates.find((g) => g.required && !g.ok);

  if (!missing) return;

  const el = document.getElementById(missing.targetId);
  if (!el) return;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Add pulse outline animation
  el.classList.add('outline-pulse');
  setTimeout(() => {
    el.classList.remove('outline-pulse');
  }, 2000);
}
