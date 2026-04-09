import type { Team, RequestType, SeverityLevel } from '../../../shared/types/api.types';

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface WizardState {
  step: StepId;

  // Step 1
  team: Team | null;

  // Step 2
  requestType: RequestType | null;

  // Step 3
  severity: SeverityLevel | null;
  archComponent: { id: string; code: string; label: string } | null;
  affectedUrl: string;
  reproduced: 'always' | 'sometimes' | 'never' | '';
  expectedBehavior: string;
  actualBehavior: string;

  // Step 4
  questionIndex: number;
  answers: Record<string, string>;

  // Step 5
  slotFiles: Record<string, UploadedFile>;
  extraFiles: UploadedFile[];

  // Step 6 (success)
  submittedTicketId: string | null;
  itBriefFromServer: string | null;

  // Optional submitter info
  submitterName: string;
  submitterTg: string;
}

export interface GateItem {
  id: string;
  label: string;
  ok: boolean;
  required: boolean;
  targetId: string;
}
