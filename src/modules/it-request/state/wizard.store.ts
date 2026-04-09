import { create } from 'zustand';
import type { Team, RequestType, SeverityLevel } from '../../../shared/types/api.types';
import type { WizardState, StepId, UploadedFile } from './wizard.types';

interface WizardActions {
  setStep: (step: StepId) => void;

  // Step 1
  setTeam: (team: Team) => void;

  // Step 2
  setRequestType: (rt: RequestType) => void;

  // Step 3
  setSeverity: (severity: SeverityLevel) => void;
  setArchComponent: (comp: { id: string; code: string; label: string } | null) => void;
  setAffectedUrl: (url: string) => void;
  setReproduced: (val: 'always' | 'sometimes' | 'never' | '') => void;
  setExpectedBehavior: (val: string) => void;
  setActualBehavior: (val: string) => void;

  // Step 4
  setQuestionIndex: (idx: number) => void;
  setAnswer: (questionId: string, answer: string) => void;

  // Step 5
  setSlotFile: (slotKey: string, file: UploadedFile) => void;
  removeSlotFile: (slotKey: string) => void;
  addExtraFile: (file: UploadedFile) => void;
  removeExtraFile: (index: number) => void;

  // Submitter info
  setSubmitterName: (name: string) => void;
  setSubmitterTg: (tg: string) => void;

  // Step 6
  setSubmittedTicketId: (id: string) => void;
  setItBriefFromServer: (brief: string) => void;

  // Reset
  reset: () => void;
}

const initialState: WizardState = {
  step: 1,

  // Step 1
  team: null,

  // Step 2
  requestType: null,

  // Step 3
  severity: null,
  archComponent: null,
  affectedUrl: '',
  reproduced: '',
  expectedBehavior: '',
  actualBehavior: '',

  // Step 4
  questionIndex: 0,
  answers: {},

  // Step 5
  slotFiles: {},
  extraFiles: [],

  // Step 6
  submittedTicketId: null,
  itBriefFromServer: null,

  // Submitter
  submitterName: '',
  submitterTg: '',
};

export const useWizardStore = create<WizardState & WizardActions>()((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setTeam: (team) =>
    set({
      team,
      // Clear downstream selections when team changes
      requestType: null,
      answers: {},
      questionIndex: 0,
    }),

  setRequestType: (rt) =>
    set({
      requestType: rt,
      // Clear interview answers when request type changes
      answers: {},
      questionIndex: 0,
    }),

  setSeverity: (severity) => set({ severity }),

  setArchComponent: (comp) => set({ archComponent: comp }),

  setAffectedUrl: (url) => set({ affectedUrl: url }),

  setReproduced: (val) => set({ reproduced: val }),

  setExpectedBehavior: (val) => set({ expectedBehavior: val }),

  setActualBehavior: (val) => set({ actualBehavior: val }),

  setQuestionIndex: (idx) => set({ questionIndex: idx }),

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),

  setSlotFile: (slotKey, file) =>
    set((state) => ({
      slotFiles: { ...state.slotFiles, [slotKey]: file },
    })),

  removeSlotFile: (slotKey) =>
    set((state) => {
      const next = { ...state.slotFiles };
      delete next[slotKey];
      return { slotFiles: next };
    }),

  addExtraFile: (file) =>
    set((state) => ({
      extraFiles: [...state.extraFiles, file],
    })),

  removeExtraFile: (index) =>
    set((state) => ({
      extraFiles: state.extraFiles.filter((_, i) => i !== index),
    })),

  setSubmitterName: (name) => set({ submitterName: name }),

  setSubmitterTg: (tg) => set({ submitterTg: tg }),

  setSubmittedTicketId: (id) => set({ submittedTicketId: id }),

  setItBriefFromServer: (brief) => set({ itBriefFromServer: brief }),

  reset: () => set(initialState),
}));
