import { useWizardStore } from '@/modules/it-request/state/wizard.store';
import { calcScore, scoreColor, scoreLabel } from '@/modules/it-request/utils/score';
import { getGate, canGo, scrollToMissing } from '@/modules/it-request/utils/gate';
import type { StepId } from '@/modules/it-request/state/wizard.types';

export function useWizard() {
  const state = useWizardStore();
  const score = calcScore(state);

  return {
    ...state,
    score,
    scoreColor: scoreColor(score),
    scoreLabel: scoreLabel(score),
    getGateForStep: (step: StepId) => getGate(state, step),
    canGoToNext: (step: StepId) => canGo(state, step),
    scrollToMissing: (step: StepId) => scrollToMissing(state, step),
    isBugType: state.requestType !== null && !state.requestType.code.includes('feature'),
    totalFileCount: Object.keys(state.slotFiles).length + state.extraFiles.length,
  };
}
