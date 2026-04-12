import { http, HttpResponse, delay } from 'msw';

// ── Mock Data ─────────────────────────────────────────────────────

const severityLevels = [
  { id: 'sev-p0', code: 'P0', label: 'Khẩn cấp', sla_hours: 2, sort_order: 1, color_hex: '#DC2626' },
  { id: 'sev-p1', code: 'P1', label: 'Cao', sla_hours: 8, sort_order: 2, color_hex: '#F97316' },
  { id: 'sev-p2', code: 'P2', label: 'Bình thường', sla_hours: 72, sort_order: 3, color_hex: '#EAB308' },
  { id: 'sev-p3', code: 'P3', label: 'Thấp', sla_hours: 168, sort_order: 4, color_hex: '#22C55E' },
];

const teams = [
  { id: 'team-nedu', code: 'n_edu', label: 'N-EDU', sort_order: 1 },
  { id: 'team-bloom', code: 'bloom', label: 'Bloom', sort_order: 2 },
  { id: 'team-tih', code: 'this_is_home', label: 'This is Home', sort_order: 3 },
  { id: 'team-fc', code: 'family_cloud', label: 'Family Cloud', sort_order: 4 },
  { id: 'team-nls', code: 'nhi_le_system', label: 'NhiLe System', sort_order: 5 },
  { id: 'team-nquoc', code: 'nquoc', label: 'NQuoc', sort_order: 6 },
];

const requestTypes = [
  {
    id: 'rt-bug',
    code: 'bug_report',
    label: 'Báo lỗi hệ thống',
    sort_order: 1,
    interview_questions: [
      { id: 'iq-bug-1', question: 'Lỗi xảy ra lần đầu tiên khi nào?', type: 'text' as const, sort_order: 1 },
      { id: 'iq-bug-2', question: 'Bạn đã thử cách nào để khắc phục chưa?', type: 'multiline' as const, sort_order: 2 },
    ],
    file_slots_def: [
      { key: 'screenshot', label: 'Screenshot màn hình lỗi', accept: 'image/*', required: false },
      { key: 'video', label: 'Video recording (nếu có)', accept: 'video/*', required: false },
    ],
  },
  {
    id: 'rt-login',
    code: 'login_access',
    label: 'Đăng nhập / Quyền truy cập',
    sort_order: 2,
    interview_questions: [
      { id: 'iq-login-1', question: 'Bạn đang cố đăng nhập vào hệ thống nào?', type: 'text' as const, sort_order: 1 },
      { id: 'iq-login-2', question: 'Thông báo lỗi hiển thị là gì?', type: 'multiline' as const, sort_order: 2 },
    ],
    file_slots_def: [
      { key: 'error_screenshot', label: 'Screenshot lỗi đăng nhập', accept: 'image/*', required: false },
    ],
  },
  {
    id: 'rt-feature',
    code: 'feature',
    label: 'Yêu cầu tính năng mới',
    sort_order: 3,
    interview_questions: [
      { id: 'iq-feat-1', question: 'Vấn đề hiện tại (pain point) là gì?', type: 'multiline' as const, sort_order: 1 },
      { id: 'iq-feat-2', question: 'Mô tả tính năng lý tưởng bạn muốn?', type: 'multiline' as const, sort_order: 2 },
    ],
    file_slots_def: [
      { key: 'sketch', label: 'Sketch / wireframe (nếu có)', accept: 'image/*', required: false },
    ],
  },
  {
    id: 'rt-perf',
    code: 'performance',
    label: 'Hiệu suất chậm',
    sort_order: 4,
    interview_questions: [
      { id: 'iq-perf-1', question: 'Trang hoặc tính năng nào đang chậm?', type: 'text' as const, sort_order: 1 },
      {
        id: 'iq-perf-2',
        question: 'Thời gian load ước tính là bao lâu?',
        type: 'select' as const,
        options: ['3-5 giây', '5-10 giây', 'Hơn 10 giây', 'Load mãi'],
        sort_order: 2,
      },
    ],
    file_slots_def: [
      { key: 'recording', label: 'Video ghi lại tình trạng chậm', accept: 'video/*', required: false },
    ],
  },
  {
    id: 'rt-data',
    code: 'data_issue',
    label: 'Vấn đề dữ liệu',
    sort_order: 5,
    interview_questions: [
      { id: 'iq-data-1', question: 'Dữ liệu bị sai ở chỗ nào? Mô tả chi tiết.', type: 'multiline' as const, sort_order: 1 },
      { id: 'iq-data-2', question: 'Trang hoặc bảng dữ liệu bị ảnh hưởng?', type: 'text' as const, sort_order: 2 },
    ],
    file_slots_def: [
      { key: 'screenshot', label: 'Screenshot dữ liệu sai', accept: 'image/*', required: false },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Handlers ──────────────────────────────────────────────────────

export const handlers = [
  // Lookup: Severity Levels
  http.get('*/api/v1/it/lookup/severity-levels', async () => {
    await delay(200);
    return HttpResponse.json({ data: severityLevels });
  }),

  // Lookup: Teams
  http.get('*/api/v1/it/lookup/teams', async () => {
    await delay(200);
    return HttpResponse.json({ data: teams });
  }),

  // Lookup: Request Types
  http.get('*/api/v1/it/lookup/request-types', async () => {
    await delay(200);
    return HttpResponse.json({ data: requestTypes });
  }),

  // Create Ticket
  http.post('*/api/v1/it/tickets', async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as Record<string, unknown>;

    const severityId = body.severity_id as string;
    const severity = severityLevels.find((s) => s.id === severityId);
    const teamId = body.team_id as string;
    const team = teams.find((t) => t.id === teamId);
    const requestTypeId = body.request_type_id as string;
    const requestType = requestTypes.find((r) => r.id === requestTypeId);

    const ticketId = generateUUID();
    const now = new Date().toISOString();
    const slaHours = severity?.sla_hours ?? 72;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    const ticket = {
      id: ticketId,
      status: 'new' as const,
      severity: severity
        ? { code: severity.code, label: severity.label, sla_hours: severity.sla_hours, color_hex: severity.color_hex }
        : { code: 'P2', label: 'Bình thường', sla_hours: 72, color_hex: '#EAB308' },
      team: team
        ? { code: team.code, label: team.label }
        : { code: 'unknown', label: 'Unknown' },
      request_type: requestType
        ? { code: requestType.code, label: requestType.label }
        : { code: 'unknown', label: 'Unknown' },
      affected_url: (body.affected_url as string) || undefined,
      completeness_score: (body.completeness_score as number) || 0,
      created_at: now,
      sla_deadline_at: slaDeadline,
    };

    const itBrief = [
      `🚨 [${ticket.severity.code}] ${ticket.request_type.label} — ${ticket.team.label}`,
      `👤 ${(body.submitted_by_name as string) || 'Anonymous'}${body.submitter_tg ? ` (${body.submitter_tg})` : ''}`,
      ticket.affected_url ? `🔗 ${ticket.affected_url}` : '',
      `📊 Completeness: ${ticket.completeness_score}%`,
      '',
      body.actual_behavior ? `❌ Thực tế: ${body.actual_behavior}` : '',
      body.expected_behavior ? `✅ Kỳ vọng: ${body.expected_behavior}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return HttpResponse.json(
      { data: { ticket, it_brief: itBrief } },
      { status: 201 }
    );
  }),

  // My Tickets: List
  http.get('*/api/v1/it/my-tickets', async () => {
    await delay(200);
    return HttpResponse.json({
      data: [],
      pagination: { has_more: false, total_count: 0 },
    });
  }),

  // My Tickets: Get by ID
  http.get('*/api/v1/it/my-tickets/:id', async () => {
    await delay(200);
    return HttpResponse.json(
      {
        code: 'NOT_FOUND',
        message: 'Ticket không tồn tại hoặc bạn không có quyền truy cập.',
        request_id: generateUUID(),
      },
      { status: 404 }
    );
  }),

  // My Tickets: Cancel
  http.delete('*/api/v1/it/my-tickets/:id', async ({ params }) => {
    await delay(300);
    return HttpResponse.json({
      data: { id: params.id, status: 'cancelled' },
    });
  }),
];
