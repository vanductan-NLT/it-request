// ── Lookup ────────────────────────────────────────────────────────

export interface SeverityLevel {
  id: string;
  code: 'P0' | 'P1' | 'P2' | 'P3';
  label: string;
  sla_hours: number;
  sort_order: number;
  color_hex: string;
}

export interface Team {
  id: string;
  code: string;
  label: string;
  sort_order: number;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiline' | 'select';
  options?: string[];
}

export interface FileSlotDef {
  key: string;
  label: string;
  accept?: string;
  required: boolean;
}

export interface RequestType {
  id: string;
  code: string;
  label: string;
  sort_order: number;
  interview_questions: InterviewQuestion[];
  file_slots_def: FileSlotDef[];
}

// ── Ticket ────────────────────────────────────────────────────────

export type TicketStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'pending_info'
  | 'done'
  | 'verified'
  | 'cancelled';

export interface SeverityInline {
  code: string;
  label: string;
  sla_hours: number;
  color_hex: string;
}
export interface TeamInline {
  code: string;
  label: string;
}
export interface RequestTypeInline {
  code: string;
  label: string;
}

export interface TicketSummary {
  id: string;
  status: TicketStatus;
  severity: SeverityInline;
  team: TeamInline;
  request_type: RequestTypeInline;
  submitter_name?: string;
  affected_url?: string;
  completeness_score: number;
  created_at: string;
  sla_deadline_at?: string;
  assigned_to_name?: string;
}

export interface TicketDetail extends TicketSummary {
  arch_component?: { code: string; label: string };
  reproduced?: 'always' | 'sometimes' | 'never';
  expected_behavior?: string;
  actual_behavior?: string;
  interview_answers: Array<{ question: string; answer: string }>;
  env_info?: { browser: string; os: string; screen: string };
  submitter_tg?: string;
  file_count: number;
  updated_at: string;
}

// ── API Response Wrappers ─────────────────────────────────────────

export interface PaginationMeta {
  has_more: boolean;
  next_cursor?: string;
  total_count?: number;
}

export interface ApiResponse<T> {
  data: T;
}
export interface ListResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
export interface ErrorResponse {
  code: string;
  message: string;
  request_id: string;
  field_errors?: Array<{ field: string; code: string; message: string }>;
}

export const ERROR_CODES = {
  INVALID_JWT: 'INVALID_JWT',
  INSUFFICIENT_ROLE: 'INSUFFICIENT_ROLE',
  OWNERSHIP_VIOLATION: 'OWNERSHIP_VIOLATION',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MALFORMED_REQUEST: 'MALFORMED_REQUEST',
  TICKET_ALREADY_CLAIMED: 'TICKET_ALREADY_CLAIMED',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
} as const;

// ── Checklist ─────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  template_item_id: string;
  step_order: number;
  label: string;
  description?: string;
  is_required: boolean;
  done: boolean;
  done_at?: string;
  done_by_name?: string;
}

export interface ChecklistProgress {
  done_count: number;
  total_count: number;
  percentage: number;
}

// ── Activity ──────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  event_type: string;
  occurred_at: string;
  actor_name?: string;
  description: string;
  is_internal_note: boolean;
  note_content?: string;
}

export interface TicketNote {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

// ── Create Ticket Body ─────────────────────────────────────────────

export interface CreateTicketBody {
  team_id: string;
  request_type_id: string;
  severity_id: string;
  arch_component_id?: string;
  affected_url?: string;
  reproduced?: 'always' | 'sometimes' | 'never';
  expected_behavior?: string;
  actual_behavior?: string;
  interview_answers: Array<{ question: string; answer: string }>;
  submitted_by_name?: string;
  submitter_tg?: string;
  completeness_score: number;
  env_info: { browser?: string; os?: string; screen?: string };
}
