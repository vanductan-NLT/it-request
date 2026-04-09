# CLAUDE.md — NQuoc Platform · IT Module
# Tài liệu: NL-CLAUDE-IT-001 v1.0 · Tháng 4/2026
# Trạng thái: Ready for Claude Code
# Input: NQUOC-ARCHITECTURE-IT-001 · NL-US-IT-FULL-001 · NQUOC-API-IT-001 · big-picture.html
# ─────────────────────────────────────────────────────────────────────────────

---

## 1. MỤC ĐÍCH

NQuoc Platform IT Module là vòng lặp phản hồi khép kín đầu tiên của NQuoc Platform, gồm hai React SPA độc lập cùng gọi vào một Backend API duy nhất. IT Request Portal (`dashboard.it.nquoc.vn`) cho phép 130+ nhân viên non-tech mô tả vấn đề IT qua wizard 6 bước và tạo ra brief chuẩn hóa; IT Ops Portal (`it.nquoc.vn`) là bàn làm việc tập trung của IT team 4–6 người để nhận, xử lý, và phản hồi ticket theo priority. Module này là foundation pattern cho toàn bộ NQuoc Platform — cách wizard dẫn dắt, ops dashboard phân quyền, Telegram relay tích hợp — sẽ được tái sử dụng cho HR, Finance, Operations Module sau này.

---

## 2. TECH STACK

### Cố định — KHÔNG thay đổi

| Layer | Công nghệ |
|---|---|
| Frontend Runtime | React 18 + TypeScript 5 + Vite |
| Styling | TailwindCSS 3 + shadcn/ui |
| Server State | React Query (TanStack Query v5) |
| UI State | Zustand |
| Mock API | MSW (Mock Service Worker) v2 |
| Auth Client | Supabase Auth SDK |
| Database | Supabase (PostgreSQL) + RLS |
| Backend Runtime | Bun + TypeScript |
| Backend Framework | Hono (hoặc Express — implementation detail) |
| Deploy | Vercel |
| Font Headlines | Playfair Display |
| Font Body | Inter |

### Đặc thù IT Module

| Item | Value |
|---|---|
| IT Request Portal domain | `dashboard.it.nquoc.vn` |
| IT Ops Portal domain | `it.nquoc.vn` |
| Backend API domain | `api.nquoc.vn` |
| Auth provider | Supabase Auth — Google OAuth (NhiLe Google Workspace) |
| Notification Phase 1 | Human copy-paste Telegram (không cần Bot Token) |
| Notification Phase 2 | Telegram Bot API (auto-send, cần `TELEGRAM_BOT_TOKEN`) |
| Realtime Phase 2 | Supabase Realtime subscription |
| File storage Phase 2 | Wasabi / Supabase Storage |
| Backend pattern | Modular Monolith — IT module là `src/modules/it/` |

---

## 3. FILE STRUCTURE

### 3A — IT Request Portal (`nquoc-it-request`)

```
nquoc-it-request/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env
├── .env.example
│
├── public/
│   └── favicon.ico
│
└── src/
    ├── main.tsx                        # Mount React + MSW conditional start
    ├── App.tsx                         # Router setup + AuthGuard
    ├── router.tsx                      # Route definitions
    │
    ├── modules/
    │   └── it-request/
    │       ├── ITRequestPage.tsx       # Wizard container — renders step 1–5, SuccessPage for step 6
    │       │
    │       ├── state/
    │       │   ├── wizard.store.ts     # Zustand store — WizardState + actions
    │       │   └── wizard.types.ts     # WizardState, UploadedFile, GateItem interfaces
    │       │
    │       ├── hooks/
    │       │   ├── useWizard.ts        # canGo(step), calcScore(), getGate(step), scrollToMissing()
    │       │   ├── useLookupData.ts    # React Query: fetch teams, severity, requestTypes (cache 5min)
    │       │   └── useSubmitTicket.ts  # React Query mutation: POST /it/tickets
    │       │
    │       ├── utils/
    │       │   ├── score.ts            # calcScore(): pure fn → 0-100
    │       │   ├── gate.ts             # getGate(step): GateItem[] · canGo(step): boolean
    │       │   ├── brief-builder.ts    # buildBrief(): Telegram text (fallback nếu backend chậm)
    │       │   ├── prompt-builder.ts   # buildPrompt(): Claude prompt 5-section
    │       │   └── env-detect.ts       # ENV = { browser, os, screen } — computed once at load
    │       │
    │       ├── components/
    │       │   ├── layout/
    │       │   │   ├── WizardHeader.tsx     # Logo + title
    │       │   │   ├── WizardTimeline.tsx   # 6 dots sticky top: done=✓ green / active=pulse / locked=grey
    │       │   │   ├── ScoreBar.tsx         # 0-100% sticky, màu red/yellow/green, realtime
    │       │   │   └── GatePanel.tsx        # Sticky bottom: checklist items, click → scrollToMissing()
    │       │   │
    │       │   ├── steps/
    │       │   │   ├── Step1Team.tsx        # 6 team cards (load từ API)
    │       │   │   ├── Step2RequestType.tsx # Request type cards (load từ API)
    │       │   │   ├── Step3Context.tsx     # Severity cards + URL field + Component grid + E/A + Repro
    │       │   │   ├── Step4Interview.tsx   # Chat UI: IT avatar left, user bubble right, Q-dots
    │       │   │   └── Step5Upload.tsx      # Slot grid + general dropzone + IT Brief tab + Claude Prompt tab
    │       │   │
    │       │   ├── modals/
    │       │   │   └── SendModal.tsx        # Status message + brief preview + files + "✓ Đã gửi xong"
    │       │   │
    │       │   └── success/
    │       │       └── SuccessPage.tsx      # Full-page: ✅ emoji + summary + SLA + Edit/Delete/New buttons
    │       │
    │       └── services/
    │           └── it-request.service.ts   # API calls + MSW mock toggle
    │
    ├── shared/
    │   ├── components/
    │   │   ├── AuthGuard.tsx           # Check Supabase session → redirect Google OAuth
    │   │   ├── LoginPage.tsx           # "Đăng nhập bằng Google" button
    │   │   ├── NotFoundPage.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   └── Toast.tsx               # useToast hook + portal
    │   │
    │   ├── lib/
    │   │   ├── supabase.ts             # createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    │   │   ├── api.ts                  # fetch wrapper: gắn Bearer JWT, handle 401/403
    │   │   └── query-client.ts         # React Query QueryClient config
    │   │
    │   ├── hooks/
    │   │   ├── useAuth.ts              # Supabase session + user info
    │   │   └── useToast.ts
    │   │
    │   └── types/
    │       └── api.types.ts            # Shared API types (TicketSummary, ErrorResponse, v.v.)
    │
    └── mocks/
        ├── browser.ts                  # MSW setup cho Vite dev
        └── handlers/
            └── it-request.handlers.ts  # Mock: GET lookup, POST /it/tickets, GET /my-tickets
```

---

### 3B — IT Ops Portal (`nquoc-it-ops`)

```
nquoc-it-ops/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env
├── .env.example
│
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── router.tsx
    │
    ├── modules/
    │   └── it-ops/
    │       ├── ITOpsDashboardPage.tsx   # Main layout: left list + right detail panel
    │       │
    │       ├── state/
    │       │   ├── ops.store.ts         # Zustand: selectedTicketId, currentView, currentFilter, search
    │       │   └── ops.types.ts
    │       │
    │       ├── hooks/
    │       │   ├── useInbox.ts          # React Query: GET /it/tickets/inbox (poll 30s)
    │       │   ├── useMyWork.ts         # React Query: GET /it/tickets/my-work
    │       │   ├── useTicketDetail.ts   # React Query: GET /it/tickets/:id
    │       │   ├── useChecklist.ts      # GET + PATCH checklist
    │       │   ├── useActivity.ts       # GET /it/tickets/:id/activity
    │       │   ├── useClaimTicket.ts    # POST /it/tickets/:id/claim mutation
    │       │   ├── useUpdateStatus.ts   # PATCH /it/tickets/:id/status mutation
    │       │   ├── useAddNote.ts        # POST /it/tickets/:id/notes mutation
    │       │   ├── useNotify.ts         # POST /it/tickets/:id/notify mutation
    │       │   └── useKeyboardShortcuts.ts  # J/K navigate, / search, ⌘K palette, ? help, Shift+T claim
    │       │
    │       ├── utils/
    │       │   ├── sla.ts               # slaState(t), slaFill(t), slaLabel(t)
    │       │   └── telegram-builder.ts  # buildDefaultMsg(t): pre-fill Telegram panel
    │       │
    │       ├── components/
    │       │   ├── layout/
    │       │   │   ├── OpsHeader.tsx            # Logo + nav tabs (Inbox / Việc của tôi) + badge + user
    │       │   │   └── CommandPalette.tsx        # ⌘K overlay: search + quick actions
    │       │   │
    │       │   ├── inbox/
    │       │   │   ├── InboxView.tsx            # Container: MetricsBar + P0Banner + FilterChips + SearchBar + TicketList
    │       │   │   ├── MetricsBar.tsx           # 4 cards: P0/P1 urgent / Total open / Done today / SLA at risk
    │       │   │   ├── P0AlertBanner.tsx        # Sticky red pulse banner khi có P0 open
    │       │   │   ├── FilterChips.tsx          # All / New / Mine / In Progress / P0 / P1
    │       │   │   ├── SearchBar.tsx            # Realtime search: ID, team, label, component, URL
    │       │   │   ├── TicketList.tsx           # Group by severity P0→P3, sorted by SLA urgency
    │       │   │   └── TicketRow.tsx            # Row: severity badge + title + URL chip + SLA bar + hover actions
    │       │   │
    │       │   ├── my-work/
    │       │   │   ├── MyWorkView.tsx           # Container: header + 3 groups
    │       │   │   └── WorkCard.tsx             # Card: severity border + status pill + URL + checklist mini-bar + SLA + quick actions
    │       │   │
    │       │   ├── detail/
    │       │   │   ├── DetailPanel.tsx          # Right panel: header + workflow bar + 3 tabs
    │       │   │   ├── DetailHeader.tsx         # Ticket ID + severity badge + meta pills (URL, component, checklist, score)
    │       │   │   ├── WorkflowBar.tsx          # Status buttons: Nhận → Start → Cần info → Done → Verified
    │       │   │   ├── OverviewTab.tsx          # Team / Loại / Severity / URL box / E&A / Repro / Interview answers / Env
    │       │   │   ├── ChecklistTab.tsx         # Progress bar + checkbox list + per-item 📱 Telegram button
    │       │   │   ├── ActivityTab.tsx          # Timeline: events + IT notes + note input textarea
    │       │   │   └── UrlDisplay.tsx           # URL box: icon + full URL + Copy + "Mở tab ↗"
    │       │   │
    │       │   ├── modals/
    │       │   │   └── ClaimModal.tsx           # Preview: severity, title, URL, SLA, submitter + 2 buttons
    │       │   │
    │       │   └── telegram/
    │       │       ├── TelegramPanel.tsx        # Slide-in panel right: fake Telegram header + chat history + textarea
    │       │       └── TemplateChips.tsx        # 4 templates: Đã nhận / Đang xử lý / Cần thêm info / Đã fix
    │       │
    │       └── services/
    │           └── it-ops.service.ts            # API calls + MSW mock toggle
    │
    ├── shared/                                  # Giống nquoc-it-request/shared/
    │   ├── components/
    │   │   ├── AuthGuard.tsx                    # Thêm role check: it_member | it_leader | admin | owner → 403 page
    │   │   ├── ForbiddenPage.tsx                # "Bạn không có quyền truy cập"
    │   │   ├── LoginPage.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   └── Toast.tsx
    │   ├── lib/
    │   │   ├── supabase.ts
    │   │   ├── api.ts
    │   │   └── query-client.ts
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   └── useToast.ts
    │   └── types/
    │       └── api.types.ts
    │
    └── mocks/
        ├── browser.ts
        └── handlers/
            └── it-ops.handlers.ts   # Mock: inbox, my-work, claim, status, checklist, activity, notify
```

---

### 3C — Backend IT Module (`nquoc-backend/src/modules/it/`)

```
nquoc-backend/
├── package.json
├── tsconfig.json
├── bunfig.toml
├── .env
├── .env.example
│
├── supabase/
│   └── migrations/
│       ├── 001_it_lookup_tables.sql
│       ├── 002_it_core_tables.sql
│       ├── 003_it_rls_policies.sql
│       └── 004_it_seed_data.sql
│
└── src/
    ├── index.ts                        # Server entry: Hono app + mount routes + start
    │
    ├── shared/
    │   ├── db.ts                       # PostgreSQL connection pool (postgres lib, direct connection)
    │   ├── jwt.ts                      # verifySupabaseJWT(token): decode + verify bằng SUPABASE_JWT_SECRET
    │   ├── errors.ts                   # AppError class, error codes constants
    │   ├── logger.ts                   # Structured logging
    │   └── types.ts                    # JWTPayload, AuthUser, AppContext interfaces
    │
    └── modules/
        └── it/
            ├── it.routes.ts            # Mount: /it/lookup/*, /it/tickets/*, /it/my-tickets/*
            │
            ├── middleware/
            │   ├── auth.middleware.ts  # Extract + verify JWT → ctx.user
            │   └── role.middleware.ts  # requireRole(['it_member','it_leader',...]) → 403 nếu fail
            │
            ├── routes/
            │   ├── lookup.routes.ts    # GET /it/lookup/severity-levels|teams|request-types
            │   ├── it-request.routes.ts# POST /it/tickets, GET/DELETE /it/my-tickets, GET /it/my-tickets/:id
            │   └── it-ops.routes.ts    # inbox, my-work, detail, claim, status, checklist, activity, notes, notify
            │
            ├── controllers/
            │   ├── lookup.controller.ts
            │   ├── it-request.controller.ts
            │   └── it-ops.controller.ts
            │
            ├── services/
            │   ├── ticket.service.ts           # createTicket, cancelTicket, claimTicket, updateStatus
            │   ├── checklist.service.ts        # snapshotChecklist, getChecklist, tickItem
            │   ├── activity.service.ts         # getActivity (merge ticket_events + notes)
            │   ├── notes.service.ts            # addNote
            │   ├── brief-builder.service.ts    # buildItBrief(ticket): Telegram text
            │   └── telegram-draft.service.ts   # buildDraft(templateType, ticket, progress): draft_text + deep_link
            │
            ├── repositories/
            │   ├── lookup.repo.ts       # getSeverityLevels, getTeams, getRequestTypes (với questions + slots)
            │   ├── ticket.repo.ts       # findById, findInbox, findMyWork, findMyTickets, insert, updateStatus
            │   ├── checklist.repo.ts    # getByTicketId, updateItem
            │   ├── events.repo.ts       # insertEvent (append-only)
            │   └── notes.repo.ts        # insert, findByTicketId
            │
            └── validators/
                ├── create-ticket.validator.ts   # Zod schema cho POST /it/tickets body
                ├── update-status.validator.ts   # Zod schema: status enum + valid transitions
                ├── tick-checklist.validator.ts  # Zod: { done: boolean }
                ├── add-note.validator.ts        # Zod: { content: string 1-2000 }
                └── notify.validator.ts          # Zod: template_type + checklist_progress conditional
```

---

## 4. DATABASE SCHEMA

### Migration 001 — Lookup Tables

```sql
-- it_severity_levels
CREATE TABLE it_severity_levels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE CHECK (code IN ('P0','P1','P2','P3')),
  label       TEXT NOT NULL,
  sla_hours   INT  NOT NULL,
  sort_order  INT  NOT NULL,
  color_hex   TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- it_teams
CREATE TABLE it_teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  sort_order  INT  NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- it_request_types
CREATE TABLE it_request_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  sort_order  INT  NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- it_interview_questions (per request_type)
CREATE TABLE it_interview_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type_id UUID NOT NULL REFERENCES it_request_types(id),
  question_id     TEXT NOT NULL,           -- 'q1', 'q2', 'q3'
  question        TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('text','multiline','select')),
  options         JSONB,                   -- string[] for select, NULL otherwise
  sort_order      INT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true
);

-- it_file_slot_defs (per request_type)
CREATE TABLE it_file_slot_defs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type_id UUID NOT NULL REFERENCES it_request_types(id),
  key             TEXT NOT NULL,
  label           TEXT NOT NULL,
  accept          TEXT,                    -- MIME pattern e.g. 'image/*'
  is_required     BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL
);

-- it_arch_components (8 components)
CREATE TABLE it_arch_components (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  sort_order  INT  NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

-- it_checklist_templates (per request_type)
CREATE TABLE it_checklist_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type_id UUID NOT NULL REFERENCES it_request_types(id),
  step_order      INT  NOT NULL,
  label           TEXT NOT NULL,
  description     TEXT,
  is_required     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_roles (NQuoc Platform — shared)
CREATE TABLE user_roles (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member'
              CHECK (role IN ('member','it_member','it_leader','admin','owner')),
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by  UUID REFERENCES auth.users(id)
);
```

### Migration 002 — Core Tables

```sql
-- it_tickets
CREATE TABLE it_tickets (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Submitter
  submitter_id        UUID        NOT NULL REFERENCES auth.users(id),
  submitted_by_name   TEXT,
  submitter_tg        TEXT,                -- @handle, nullable (optional)

  -- Classification
  team_id             UUID        NOT NULL REFERENCES it_teams(id),
  request_type_id     UUID        NOT NULL REFERENCES it_request_types(id),
  severity_id         UUID        NOT NULL REFERENCES it_severity_levels(id),
  arch_component_id   UUID        REFERENCES it_arch_components(id),

  -- Context
  affected_url        TEXT,
  reproduced          TEXT        CHECK (reproduced IN ('always','sometimes','never')),
  expected_behavior   TEXT,
  actual_behavior     TEXT,
  interview_answers   JSONB       NOT NULL DEFAULT '[]',  -- [{question, answer}]

  -- Environment (auto-detected by client)
  env_browser         TEXT,
  env_os              TEXT,
  env_screen          TEXT,

  -- Status & Assignment
  status              TEXT        NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new','assigned','in_progress','pending_info','done','verified','cancelled')),
  assigned_to         UUID        REFERENCES auth.users(id),

  -- SLA
  sla_deadline_at     TIMESTAMPTZ,         -- set on INSERT: created_at + sla_hours

  -- Quality
  completeness_score  SMALLINT    NOT NULL DEFAULT 0 CHECK (completeness_score BETWEEN 0 AND 100)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER it_tickets_set_updated_at
  BEFORE UPDATE ON it_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ticket_events (append-only audit trail — NO UPDATE, NO DELETE)
CREATE TABLE ticket_events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     UUID        NOT NULL REFERENCES it_tickets(id) ON DELETE CASCADE,
  event_type    TEXT        NOT NULL,
  -- Possible event_type values:
  --   ticket_created | ticket_cancelled | ticket_claimed
  --   ticket_started | ticket_info_requested | ticket_done | ticket_verified
  --   checklist_item_ticked | note_added | telegram_sent
  actor_id      UUID        REFERENCES auth.users(id),
  actor_name    TEXT,
  payload       JSONB       NOT NULL DEFAULT '{}',
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ticket_checklist_items (snapshot from template at ticket_created — ADR-API-003)
CREATE TABLE ticket_checklist_items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id         UUID        NOT NULL REFERENCES it_tickets(id) ON DELETE CASCADE,
  template_item_id  UUID        NOT NULL REFERENCES it_checklist_templates(id),
  step_order        INT         NOT NULL,
  label             TEXT        NOT NULL,
  description       TEXT,
  is_required       BOOLEAN     NOT NULL DEFAULT false,
  done              BOOLEAN     NOT NULL DEFAULT false,
  done_at           TIMESTAMPTZ,
  done_by           UUID        REFERENCES auth.users(id),
  done_by_name      TEXT
);

-- it_ticket_notes (IT internal notes — not visible to member)
CREATE TABLE it_ticket_notes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID        NOT NULL REFERENCES it_tickets(id) ON DELETE CASCADE,
  author_id   UUID        NOT NULL REFERENCES auth.users(id),
  author_name TEXT        NOT NULL,
  content     TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- it_ticket_files (Phase 2 — file attachments)
CREATE TABLE it_ticket_files (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID        NOT NULL REFERENCES it_tickets(id) ON DELETE CASCADE,
  slot_key    TEXT,                -- named slot key, null if general upload
  file_name   TEXT        NOT NULL,
  file_type   TEXT,
  file_size   INT,
  storage_url TEXT,                -- Wasabi / Supabase Storage URL
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Migration 003 — RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE it_tickets               ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_checklist_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_ticket_notes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_ticket_files          ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user has IT role
CREATE OR REPLACE FUNCTION is_it_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('it_member','it_leader','admin','owner')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ── it_tickets ────────────────────────────────────────────────────
-- Member thấy ticket của mình; IT thấy tất cả
CREATE POLICY "it_tickets_select" ON it_tickets
  FOR SELECT USING (
    auth.uid() = submitter_id OR is_it_user()
  );

-- Chỉ member INSERT ticket của mình
CREATE POLICY "it_tickets_insert" ON it_tickets
  FOR INSERT WITH CHECK (auth.uid() = submitter_id);

-- Member cancel ticket của mình khi status='new'; IT update bất kỳ
CREATE POLICY "it_tickets_update" ON it_tickets
  FOR UPDATE USING (
    (auth.uid() = submitter_id AND status = 'new')
    OR is_it_user()
  );

-- Không ai DELETE (soft cancel qua UPDATE status='cancelled')
-- No DELETE policy → blocked

-- ── ticket_events (append-only) ───────────────────────────────────
-- Chỉ IT đọc events; backend INSERT bằng service role
CREATE POLICY "ticket_events_select" ON ticket_events
  FOR SELECT USING (is_it_user());

CREATE POLICY "ticket_events_insert" ON ticket_events
  FOR INSERT WITH CHECK (true);  -- backend service role

-- No UPDATE, No DELETE → append-only enforced

-- ── ticket_checklist_items ────────────────────────────────────────
CREATE POLICY "checklist_select" ON ticket_checklist_items
  FOR SELECT USING (is_it_user());

CREATE POLICY "checklist_insert" ON ticket_checklist_items
  FOR INSERT WITH CHECK (true);  -- backend service role (snapshot on create)

CREATE POLICY "checklist_update" ON ticket_checklist_items
  FOR UPDATE USING (is_it_user());

-- ── it_ticket_notes ───────────────────────────────────────────────
CREATE POLICY "notes_select" ON it_ticket_notes
  FOR SELECT USING (is_it_user());

CREATE POLICY "notes_insert" ON it_ticket_notes
  FOR INSERT WITH CHECK (is_it_user());

-- No UPDATE, No DELETE

-- ── it_ticket_files ───────────────────────────────────────────────
CREATE POLICY "files_select" ON it_ticket_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM it_tickets t
      WHERE t.id = ticket_id
      AND (t.submitter_id = auth.uid() OR is_it_user())
    )
  );

CREATE POLICY "files_insert" ON it_ticket_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM it_tickets t
      WHERE t.id = ticket_id AND t.submitter_id = auth.uid()
    )
  );
```

### Migration 004 — Seed Data

```sql
-- Severity levels
INSERT INTO it_severity_levels (code, label, sla_hours, sort_order, color_hex) VALUES
  ('P0', 'Khẩn cấp',  2,   1, '#DC2626'),
  ('P1', 'Cao',        8,   2, '#F97316'),
  ('P2', 'Bình thường',72,  3, '#EAB308'),
  ('P3', 'Thấp',       168, 4, '#22C55E');

-- Teams
INSERT INTO it_teams (code, label, sort_order) VALUES
  ('n_edu',         'N-EDU',          1),
  ('bloom',         'Bloom',          2),
  ('this_is_home',  'This is Home',   3),
  ('family_cloud',  'Family Cloud',   4),
  ('nhi_le_system', 'NhiLe System',   5),
  ('nquoc',         'NQuoc',          6);

-- Arch components
INSERT INTO it_arch_components (code, label, sort_order) VALUES
  ('nquoc_vn',      'nquoc.vn',        1),
  ('team_nquoc_vn', 'team.nquoc.vn',   2),
  ('data_nquoc_vn', 'data.nquoc.vn',   3),
  ('api_nquoc_vn',  'api.nquoc.vn',    4),
  ('supabase',      'Supabase',        5),
  ('tbot_nquoc_vn', 'tbot.nquoc.vn',   6),
  ('external',      'External',        7),
  ('unknown',       'Không rõ',        8);

-- Request types (sample — IT Leader bổ sung thêm qua admin)
INSERT INTO it_request_types (code, label, sort_order) VALUES
  ('bug_report',    'Báo lỗi hệ thống',        1),
  ('login_access',  'Đăng nhập / Quyền truy cập', 2),
  ('feature',       'Yêu cầu tính năng mới',   3),
  ('performance',   'Hiệu suất chậm',           4),
  ('data_issue',    'Vấn đề dữ liệu',           5);

-- Interview questions cho bug_report
INSERT INTO it_interview_questions (request_type_id, question_id, question, type, sort_order)
SELECT id, 'q1', 'Lỗi xảy ra lần đầu tiên khi nào?', 'text', 1 FROM it_request_types WHERE code = 'bug_report';
INSERT INTO it_interview_questions (request_type_id, question_id, question, type, sort_order)
SELECT id, 'q2', 'Bạn đã thử cách nào để khắc phục chưa?', 'multiline', 2 FROM it_request_types WHERE code = 'bug_report';
INSERT INTO it_interview_questions (request_type_id, question_id, question, type, options, sort_order)
SELECT id, 'q3', 'Lỗi có tái diễn mỗi lần thử không?', 'select',
  '["Luôn luôn","Thỉnh thoảng","Chỉ xảy ra 1 lần"]'::jsonb, 3
FROM it_request_types WHERE code = 'bug_report';

-- Interview questions cho login_access
INSERT INTO it_interview_questions (request_type_id, question_id, question, type, sort_order)
SELECT id, 'q1', 'Bạn đang cố đăng nhập vào hệ thống nào?', 'text', 1 FROM it_request_types WHERE code = 'login_access';
INSERT INTO it_interview_questions (request_type_id, question_id, question, type, sort_order)
SELECT id, 'q2', 'Thông báo lỗi hiển thị là gì?', 'multiline', 2 FROM it_request_types WHERE code = 'login_access';

-- File slots cho bug_report
INSERT INTO it_file_slot_defs (request_type_id, key, label, accept, is_required, sort_order)
SELECT id, 'screenshot', 'Screenshot màn hình lỗi', 'image/*', false, 1 FROM it_request_types WHERE code = 'bug_report';
INSERT INTO it_file_slot_defs (request_type_id, key, label, accept, is_required, sort_order)
SELECT id, 'video', 'Video recording (nếu có)', 'video/*', false, 2 FROM it_request_types WHERE code = 'bug_report';

-- Checklist templates cho bug_report
INSERT INTO it_checklist_templates (request_type_id, step_order, label, description, is_required)
SELECT id, 1, 'Xác nhận lỗi reproduce được trên máy IT', 'Mở URL đang lỗi, thực hiện đúng các bước user mô tả.', true FROM it_request_types WHERE code = 'bug_report';
INSERT INTO it_checklist_templates (request_type_id, step_order, label, is_required)
SELECT id, 2, 'Kiểm tra console log và server log', true FROM it_request_types WHERE code = 'bug_report';
INSERT INTO it_checklist_templates (request_type_id, step_order, label, is_required)
SELECT id, 3, 'Kiểm tra API gateway / network requests', true FROM it_request_types WHERE code = 'bug_report';
INSERT INTO it_checklist_templates (request_type_id, step_order, label, is_required)
SELECT id, 4, 'Tìm và isolate nguyên nhân gốc rễ', true FROM it_request_types WHERE code = 'bug_report';
INSERT INTO it_checklist_templates (request_type_id, step_order, label, is_required)
SELECT id, 5, 'Deploy fix và verify trên staging', false FROM it_request_types WHERE code = 'bug_report';
INSERT INTO it_checklist_templates (request_type_id, step_order, label, is_required)
SELECT id, 6, 'Confirm fix với user trên production', true FROM it_request_types WHERE code = 'bug_report';
```

---

## 5. TYPES (TypeScript)

File: `src/shared/types/api.types.ts` — dùng chung cho cả 2 portals

```typescript
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
  | 'new' | 'assigned' | 'in_progress'
  | 'pending_info' | 'done' | 'verified' | 'cancelled';

export interface SeverityInline {
  code: string; label: string; sla_hours: number; color_hex: string;
}
export interface TeamInline { code: string; label: string; }
export interface RequestTypeInline { code: string; label: string; }

export interface TicketSummary {
  id: string;
  status: TicketStatus;
  severity: SeverityInline;
  team: TeamInline;
  request_type: RequestTypeInline;
  submitter_name?: string;      // null trong GET /my-tickets
  affected_url?: string;
  completeness_score: number;
  created_at: string;           // ISO 8601
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
  submitter_tg?: string;        // chỉ có trong IT Ops endpoints
  file_count: number;
  updated_at: string;
}

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
  percentage: number;   // floor(done/total * 100)
}

// ── Activity ──────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  event_type: string;
  occurred_at: string;
  actor_name?: string;
  description: string;           // Human-readable, backend builds
  is_internal_note: boolean;
  note_content?: string;         // chỉ có khi is_internal_note = true
}

export interface TicketNote {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

// ── API Response Wrappers ─────────────────────────────────────────

export interface PaginationMeta {
  has_more: boolean;
  next_cursor?: string;
  total_count?: number;
}

export interface ApiResponse<T> { data: T; }
export interface ListResponse<T> { data: T[]; pagination: PaginationMeta; }
export interface ErrorResponse {
  code: string;
  message: string;
  request_id: string;
  field_errors?: Array<{ field: string; code: string; message: string }>;
}

// ── Error Codes ────────────────────────────────────────────────────
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
```

File: `src/modules/it-request/state/wizard.types.ts`

```typescript
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
  answers: Record<string, string>;   // questionId → answer

  // Step 5
  slotFiles: Record<string, UploadedFile>;   // slotKey → file
  extraFiles: UploadedFile[];

  // Step 6 (success)
  submittedTicketId: string | null;
  itBriefFromServer: string | null;

  // Optional submitter info
  submitterName: string;
  submitterTg: string;   // @handle, optional
}

export interface GateItem {
  id: string;
  label: string;
  ok: boolean;
  required: boolean;
  targetId: string;   // DOM element ID để scrollIntoView
}
```

---

## 6. API CONTRACTS

Base URL: `https://api.nquoc.vn/api/v1`  
Auth: `Authorization: Bearer <supabase_jwt>` — tất cả endpoints đều required  
Error format: `{ code, message, request_id, field_errors? }` — xem Types section

### Lookup (cache 5 min, IT Request Portal)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/it/lookup/severity-levels` | `{ data: SeverityLevel[] }` — sorted P0→P3 |
| GET | `/it/lookup/teams` | `{ data: Team[] }` — sorted by sort_order |
| GET | `/it/lookup/request-types` | `{ data: RequestType[] }` — với interview_questions + file_slots_def |

### IT Request Portal (member role)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/it/tickets` | CreateTicketBody | `{ data: { ticket: TicketSummary, it_brief: string } }` 201 |
| GET | `/it/my-tickets` | `?after=uuid&limit=20&status=...` | `{ data: TicketSummary[], pagination }` |
| GET | `/it/my-tickets/:id` | — | `{ data: TicketDetail }` — không có submitter_tg |
| DELETE | `/it/my-tickets/:id` | — | `{ data: { id, status: 'cancelled' } }` 200 / 409 |

**CreateTicketBody:**
```typescript
{
  team_id: string;              // UUID từ lookup
  request_type_id: string;      // UUID từ lookup
  severity_id: string;          // UUID từ lookup
  arch_component_id?: string;   // UUID, optional
  affected_url?: string;
  reproduced?: 'always' | 'sometimes' | 'never';
  expected_behavior?: string;
  actual_behavior?: string;
  interview_answers: Array<{ question: string; answer: string }>;
  submitted_by_name?: string;
  submitter_tg?: string;        // @handle, optional
  completeness_score: number;
  env_info: { browser?: string; os?: string; screen?: string };
}
```

**Errors POST /it/tickets:**  
- 400 `MALFORMED_REQUEST` — JSON parse error  
- 401 `INVALID_JWT`  
- 422 `VALIDATION_ERROR` với `field_errors[]`

**Errors DELETE /it/my-tickets/:id:**  
- 409 `TICKET_ALREADY_CLAIMED` — ticket đã được IT nhận  
- 409 `INVALID_STATUS_TRANSITION` — status không phải 'new'

### IT Ops Portal (it_member | it_leader | admin | owner)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/it/tickets/inbox` | `?after=uuid&limit=20&team_code=...` | `{ data: TicketSummary[], pagination }` |
| GET | `/it/tickets/my-work` | — | `{ data: TicketSummary[] }` |
| GET | `/it/tickets/:id` | — | `{ data: TicketDetail }` — có submitter_tg |
| POST | `/it/tickets/:id/claim` | — | `{ data: { ticket: TicketSummary, telegram_draft: string } }` |
| PATCH | `/it/tickets/:id/status` | `{ status, note? }` | `{ data: TicketSummary }` |
| GET | `/it/tickets/:id/checklist` | — | `{ data: ChecklistItem[], progress: ChecklistProgress }` |
| PATCH | `/it/tickets/:id/checklist/:item_id` | `{ done: boolean }` | `{ data: { item, progress } }` |
| GET | `/it/tickets/:id/activity` | — | `{ data: ActivityItem[] }` |
| POST | `/it/tickets/:id/notes` | `{ content: string }` | `{ data: TicketNote }` 201 |
| POST | `/it/tickets/:id/notify` | NotifyBody | `{ data: { draft_text, deep_link, sent } }` |

**State Machine — valid transitions:**
```
new           → assigned      (via POST /claim)
assigned      → in_progress   (via PATCH /status { status: 'in_progress' })
in_progress   → pending_info  (via PATCH /status { status: 'pending_info' })
pending_info  → in_progress   (via PATCH /status { status: 'in_progress' })
in_progress   → done          (via PATCH /status { status: 'done' })
done          → verified       (via PATCH /status { status: 'verified' })
any           → cancelled     (it_leader only)
```

**NotifyBody:**
```typescript
{
  template_type: 'claimed_notify' | 'progress_update' | 'need_more_info' | 'done_notify';
  checklist_progress?: { done_count: number; total_count: number }; // required nếu progress_update
  custom_message?: string; // max 500 chars
}
```

**Errors POST /it/tickets/:id/claim:**  
- 409 `TICKET_ALREADY_CLAIMED` — race condition, ai đó claim trước  
- 409 `INVALID_STATUS_TRANSITION` — ticket không ở status 'new'

**Errors PATCH /it/tickets/:id/status:**  
- 409 `INVALID_STATUS_TRANSITION`  
- 403 `OWNERSHIP_VIOLATION` — IT Member cố update ticket không phải của mình

---

## 7. PAGES / COMPONENTS CHI TIẾT

### 7A — IT Request Portal

---

#### `ITRequestPage.tsx` — Wizard Container

**URL:** `/` (toàn bộ portal là 1 page)  
**Render logic:**
```
if (wizardState.step === 6) → render <SuccessPage />
else → render full wizard layout
```

**Full wizard layout:**
```
<WizardHeader />                      sticky, height 56px
<ScoreBar />                          sticky top 56px, height 8px bar + label
<WizardTimeline />                    sticky top 64px, height 48px
<main>                                scroll container, padding-bottom 100px
  {step === 1 && <Step1Team />}
  {step === 2 && <Step2RequestType />}
  {step === 3 && <Step3Context />}
  {step === 4 && <Step4Interview />}
  {step === 5 && <Step5Upload />}
</main>
<GatePanel />                         sticky bottom, height auto
```

---

#### `WizardTimeline.tsx`

**6 dots:** Team · Loại · Context · Phỏng vấn · Upload & Gửi · Xác nhận  
**Dot state per step:**
- `done` (step > current): ✓ icon, green fill, **clickable** → `setStep(stepId)`
- `active` (step === current): pulse animation tím `#8B5CF6`
- `locked` (step < current): grey, not clickable

**Behavior:** Click dot đã done → `setStep(stepId)`. Data không reset.

---

#### `ScoreBar.tsx`

**Score formula (`calcScore()`):**
```
team selected:        +8
requestType selected: +8
severity selected:    +12
archComponent:        +8
expectedBehavior > 5: +9
actualBehavior > 5:   +9
reproduced selected:  +5
questions answered:   (answeredCount / total) × 18
files uploaded:       (totalFiles > 0) ? 15 : 0
Total max:            100
```

**Color:**
- 0–49: `#DC2626` (đỏ)
- 50–74: `#EAB308` (vàng)
- 75–100: `#22C55E` (xanh)

**Display:** "Độ đầy đủ: 87%" — update realtime khi user điền

---

#### `GatePanel.tsx` — Sticky bottom gate

**`getGate(step)` returns `GateItem[]` per step:**

Step 1: `[{ id: 'team', label: 'Chọn team', ok: !!team, required: true, targetId: 'team-grid' }]`

Step 2: `[{ id: 'reqType', label: 'Chọn loại vấn đề', ok: !!requestType, required: true, targetId: 'reqtype-grid' }]`

Step 3 (bug type): `[severity, archComponent, expectedBehavior(>5chars), actualBehavior(>5chars)]`  
Step 3 (feature type): `[severity, archComponent]`

Step 4: `[{ id: 'interview', label: 'Trả lời tất cả câu hỏi', ok: allAnswered, required: true, targetId: 'interview-section' }]`

Step 5: `[{ id: 'file', label: 'Đính kèm ít nhất 1 file', ok: totalFiles > 0, required: true, targetId: 'upload-section' }]`

**`canGo(step)`:** `getGate(step).filter(g => g.required).every(g => g.ok)`

**Nút "Tiếp →":**
- Nếu `canGo(step)`: navigate to next step
- Nếu không: `scrollToMissing()` — tìm item.ok=false → `getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'center' })` + add `outline-pulse` CSS class 2s

**Gate items hiển thị:**
- `ok: true` → ✓ xanh
- `ok: false, required: true` → ⚠ vàng pulse — clickable → scrollToMissing

---

#### `Step1Team.tsx`

**Layout:** Grid 2-3 cols, team cards từ `useLookupData().teams`

**Team card:** icon (emoji hoặc initial) + tên team + description (nếu có)  
**Selected state:** border tím `#8B5CF6`, background tím nhạt  
**Click:** `setTeam(team)` + score update + gate recheck

---

#### `Step2RequestType.tsx`

**Layout:** List cards, requestTypes từ `useLookupData().requestTypes`

**Request type card:** emoji + label  
**Selected state:** border tím  
**Click:** `setRequestType(rt)` → load questions + file slots cho step 4, 5

**isBugType():** `!requestType.code.includes('feature')` — dùng để show/hide E/A + URL + Repro ở Step 3

---

#### `Step3Context.tsx`

**Section 1 — Severity (required):**
- 4 cards: P0 Khẩn cấp · P1 Cao · P2 Bình thường · P3 Thấp
- Mỗi card: emoji icon + label + description + SLA badge màu `color_hex`
- Selected state: border màu `color_hex`

**Section 2 — URL trang đang lỗi (required cho bug types):**
- Text input: `id="url-field"`
- Placeholder: "https://nquoc.vn/..."
- Validation: không validate format, chỉ cần non-empty cho bug types
- Show/hide: `isBugType()`

**Section 3 — Component bị ảnh hưởng (required):**
- 8-button grid: nquoc.vn · team.nquoc.vn · data.nquoc.vn · api.nquoc.vn · Supabase · tbot.nquoc.vn · External · Không rõ
- Selected: filled tím

**Section 4 — Expected / Actual (required cho bug types, min 5 chars):**
- 2 textareas side-by-side (mobile: stacked)
- Expected header: xanh `#22C55E` — "✅ Kỳ vọng"
- Actual header: đỏ `#DC2626` — "❌ Thực tế"
- id: `expected-field`, `actual-field`

**Section 5 — Reproducibility (optional):**
- 4 pill buttons: 100% · ~50% · 1 lần · Chưa thử
- Show/hide: `isBugType()`

**Auto-detect environment:** on mount, `ENV = { browser: navigator.userAgent parsed, os: navigator.platform parsed, screen: `${screen.width}x${screen.height}` }` — store immutably

---

#### `Step4Interview.tsx`

**Layout:** Chat bubble UI  
- IT avatar (left): bubble xám — câu hỏi IT
- User answer (right): bubble tím `#8B5CF6` — câu trả lời đã submit

**Q-dots progress bar:**
- `questions.length` dots
- green = done, tím = current, xám = upcoming

**Per question type:**
- `type: 'text'`: `<input>` — Enter hoặc Ctrl+Enter submit → `submitAnswer(val)`
- `type: 'multiline'`: `<textarea>` — Ctrl+Enter submit, Enter = newline
- `type: 'select'`: list buttons full-width — click → immediate `submitAnswer(val)`, không cần confirm

**"Bỏ qua câu này":** lưu `answers[q.id] = '(bỏ qua)'`, proceed to next

**Gate:** all questions answered (hoặc skipped) → `canGo(4) = true`

**Auto-navigate:** sau câu cuối → `setStep(5)`

---

#### `Step5Upload.tsx`

**Section 1 — Named file slots:**
- Grid 2-4 cols, slots từ `requestType.file_slots_def`
- Mỗi slot: emoji + label + badge "Bắt buộc"/"Tốt nếu có"
- Trống: dashed border, drag-over highlight
- Filled: solid green border + thumbnail (ảnh) hoặc file icon + name + size

**Section 2 — General dropzone:**
- Accept all file types
- Multi-select allowed
- `onDrop`: `readFile(file)` → `extraFiles.push()`
- "Thêm file khác" text + file icon

**Section 3 — Output tabs:**

**Tab "⚡ IT Brief":**
```
Content: buildBrief() output hoặc it_brief từ server response
Lines:
  🚨 [P0] Báo lỗi hệ thống — N-EDU
  👤 [submitterName] ([submitterTg])
  🔗 [affectedUrl]
  📊 Completeness: 87% | Tái diễn: Luôn luôn
  
  ❌ Thực tế: [actualBehavior]
  ✅ Kỳ vọng: [expectedBehavior]
  
  💬 Phỏng vấn:
  Q: [question1]
  A: [answer1]
  
  🖥️ [browser] / [os] / [screen]
Copy button → navigator.clipboard.writeText(briefText)
```

**Tab "📋 Claude Prompt":**
```
Content: buildPrompt() — 5-section structured prompt
Section 1: NQuoc platform context (brief)
Section 2: Ticket summary (team, type, severity, URL, component)
Section 3: Problem description (E/A, reproduced)
Section 4: Interview answers
Section 5: Request to Claude (generate User Story + IT Checklist)
Copy button
```

**"Gửi cho IT":** opens SendModal

---

#### `SendModal.tsx`

**Modal fullscreen on mobile, 480px center on desktop**

**Content:**
- Status message: score ≥ 75 → "✅ Đủ thông tin" (xanh) · 50-74 → "⚠ Gần đủ" (vàng) · <50 → "❌ Chưa đủ" (đỏ)
- Brief preview (truncated 3 lines + expand)
- Files list: slot files + extra files, count
- Primary button: **"✓ Đã gửi xong"** (tím)
- Close: X button hoặc click overlay

**"✓ Đã gửi xong" click:**
1. Call `submitTicket(wizardState)` → `POST /it/tickets`
2. On success: store `ticket.id` + `it_brief` → `setStep(6)` → render SuccessPage
3. On error: toast lỗi tiếng Việt từ `error.message`

---

#### `SuccessPage.tsx`

**Bypasses main layout hoàn toàn (no header/timeline/score/gate)**

**Content:**
```
✅ (animate-bounce, 64px)
"Yêu cầu đã được gửi!"
Tóm tắt: team · loại · severity badge · SLA · files đính kèm · timestamp

Panel xanh "Bước tiếp theo":
  1. IT confirm nhận qua Telegram
  2. IT nhắn nếu cần thêm info
  3. IT báo đã fix
  4. Bạn test và reply OK

3 buttons:
  "✏️ Chỉnh sửa / xem lại" → setStep(5), tab IT Brief — data giữ nguyên
  "🗑️ Xoá yêu cầu"       → window.confirm → if OK → DELETE /it/my-tickets/:id → reset() → setStep(1)
  "+ Gửi yêu cầu mới"    → reset() → setStep(1)
```

**SLA display:** `sevObj.sla_hours < 24 ? `${sevObj.sla_hours} giờ` : `${sevObj.sla_hours/24} ngày``

---

### 7B — IT Ops Portal

---

#### `ITOpsDashboardPage.tsx` — Main layout

**Layout (desktop-first):**
```
<OpsHeader />                          sticky top, height 56px
<main class="flex h-[calc(100vh-56px)]">
  <section class="w-[420px] border-r overflow-y-auto flex-shrink-0">
    {view === 'inbox'  && <InboxView />}
    {view === 'mywork' && <MyWorkView />}
  </section>
  <section class="flex-1 overflow-y-auto relative">
    {selectedTicketId
      ? <DetailPanel ticketId={selectedTicketId} />
      : <EmptyDetail />}  {/* "Chọn ticket để xem chi tiết" */}
  </section>
  {telegramPanelOpen && <TelegramPanel />}  {/* fixed right slide-in */}
</main>
```

---

#### `OpsHeader.tsx`

**Left:** Logo "NQuoc IT Ops"  
**Center:** 2 nav tabs:
- "📥 Inbox" + badge đỏ với total_count từ `useInbox().data?.pagination.total_count`
- "🙋 Việc của tôi" + badge số tickets đang cầm từ `useMyWork()`

**Right:** Avatar + tên IT member + "Đăng xuất"

---

#### `InboxView.tsx`

**Child components theo thứ tự:**
1. `<MetricsBar />` — 4 metrics cards
2. `<P0AlertBanner />` — conditionally rendered
3. `<FilterChips />` — filter state trong Zustand
4. `<SearchBar />` — search state trong Zustand
5. `<TicketList tickets={filtered} />` — grouped by severity

**`getFiltered(tickets, filter, search)`:**
- Filter 'Mine': `ticket.assigned_to_name === currentUser.name`
- Filter 'In Progress': `ticket.status === 'in_progress'`
- Filter 'P0': `ticket.severity.code === 'P0'`
- Search: match `id.slice(0,8)`, `team.label`, `request_type.label`, `arch_component.label`, `affected_url`
- Sort: `severity.sort_order ASC`, then `sla_deadline_at ASC`

---

#### `TicketRow.tsx`

**Layout:**
```
[severity badge] [title: reqType.label – team.label]
[URL chip "🔗 nquoc.vn/..."] [SLA bar inline] [completeness "87%"]
hover → show quick actions: [🙋 Nhận] [✓ Done]
```

**Severity badge:** colored `color_hex` background + P0/P1/P2/P3 code  
**URL chip:** strip "https://", monospace, max 35 chars + ellipsis, clickable → open tab  
**SLA bar:** `width: slaFill(ticket)%` — red (<0h), yellow (<4h), green (OK)  
**Click row:** `selectTicket(ticket.id)`

---

#### `DetailPanel.tsx`

**Header:** `<DetailHeader ticket={detail} />`  
**Workflow bar:** `<WorkflowBar ticket={detail} onStatusChange={...} />`  
**Tabs:** Overview · Checklist [X/Y] · Activity & Notes

---

#### `DetailHeader.tsx`

**Line 1:** Ticket ID (monospace short) + severity badge màu  
**Line 2 (meta pills):**
- `🔗 [URL truncated]` — click = copy, tooltip full URL
- `🖥️ [archComponent.label]`
- `✅ X/Y checklist` — green khi complete
- `📊 [completeness]%`

**Buttons:** `📱 Telegram` → `openTelegramPanel(ticketId)` · Claim (nếu status='new') · Done (nếu in_progress)

---

#### `WorkflowBar.tsx`

**Status buttons theo state machine:**
```
status = 'new':          [🙋 Nhận ticket]
status = 'assigned':     [▶ Bắt đầu xử lý]
status = 'in_progress':  [❓ Cần thêm info] [✓ Done]
status = 'pending_info': [▶ Tiếp tục xử lý]
status = 'done':         "Chờ user verify" (text, không có button)
status = 'verified':     "✅ Đã hoàn tất" (text)
```

**"🙋 Nhận ticket":** open `<ClaimModal />`  
**"▶ Bắt đầu":** `PATCH /status { status: 'in_progress' }` → update React Query cache  
**"❓ Cần info":** `PATCH /status { status: 'pending_info' }` + auto-open Telegram panel với template `need_more_info`  
**"✓ Done":** `PATCH /status { status: 'done' }` + auto-open Telegram panel với template `done_notify`

---

#### `OverviewTab.tsx`

**Sections:**
1. **Submitter:** tên + Telegram handle (nếu có)
2. **Classification:** Team · Loại · Severity + SLA · Component
3. **URL đang lỗi:** `<UrlDisplay url={detail.affected_url} />`
4. **Expected / Actual:** 2 boxes xanh/đỏ
5. **Reproducibility:** nếu có
6. **Interview Answers:** list câu hỏi + câu trả lời accordion
7. **Environment:** browser · OS · screen

---

#### `UrlDisplay.tsx`

```
[🔗 icon] [full URL text, monospace] [Copy button] [Mở tab ↗]
Copy → navigator.clipboard.writeText(url) + toast "🔗 URL copied"
Mở tab → window.open(url, '_blank')
Null URL → không render component (graceful fallback)
```

---

#### `ChecklistTab.tsx`

**Header:** Progress bar `percentage%`, tím → xanh khi 100%  
**Button "Gửi progress update":** `openTelegramPanel(id, 'progress_update')` với current checklist progress  
**Item list:**
```
[checkbox] [label] [description optional] [📱 button]
```
- Tick checkbox → `PATCH /checklist/:item_id { done: !current }`
- `📱` per item → `openTelegramPanel(id, 'progress_update', { item_label })`
- done: text-strikethrough + xanh
- undone: normal

---

#### `ActivityTab.tsx`

**Timeline (sorted occurred_at ASC — cũ ở trên, mới ở dưới):**
- System events: center text, xám
- IT actions: bubble xám trái
- IT Notes: bubble vàng nhạt, label "IT Note (nội bộ)"

**Note input (bottom):**
- Textarea placeholder "Ghi chú nội bộ..."
- "Lưu ghi chú" button → `POST /notes { content }`

---

#### `ClaimModal.tsx`

**Trigger:** click "🙋 Nhận ticket" bất kỳ đâu (header, workflow bar, list row hover)  
**Content:**
```
Preview ticket: severity badge + title + URL + SLA + submitter name
2 buttons:
  "✓ Nhận ticket + Notify user" (primary)
  "Huỷ" (secondary)
```
**"✓ Nhận ticket":**
1. `POST /it/tickets/:id/claim`
2. Ticket animate CSS `claimOut 0.4s` → slide right + height collapse
3. Sau 0.4s: re-render list (ticket biến mất)
4. Auto-open Telegram panel với `telegram_draft` từ response
5. Sau 0.8s total: `switchView('mywork')`

**Close:** click overlay / click Huỷ / Esc key

---

#### `TelegramPanel.tsx`

**Position:** `fixed right-0 top-[56px] bottom-0 w-[420px] z-[80]`  
**CSS animation:** `right: -420px → 0` slide-in 0.3s  
**Z-index:** 80 — dưới modal (100) và command palette (200)

**Header giả Telegram:**
```
background: #1c9a47
Avatar + tên user + @telegram_handle
```

**Chat history:** activity log dạng bubble
- IT actions: bubble trái
- System messages: center

**Auto-draft:** khi mở, textarea điền sẵn từ `buildDefaultMsg(ticket)`:
```
Xin chào [submitterName]!
[IT Name] đã nhận yêu cầu của bạn.
Ticket: [P1] [reqType.label]
🔗 URL: [affectedUrl]
⏰ SLA: [sla_hours]h (deadline [formatted deadline])
Mình sẽ update sớm nhất có thể. 🙏
```

**4 Quick templates:**
- "Đã nhận" → fill textarea template `claimed_notify`
- "Đang xử lý" → `progress_update` (auto-attach checklist progress)
- "Cần thêm info" → `need_more_info`
- "Đã fix" → `done_notify`

**Click template:** fill textarea + preview

**"📋 Copy":** `navigator.clipboard.writeText(textarea.value)` + toast  
**"📱 Gửi qua Telegram":**
1. `POST /it/tickets/:id/notify { template_type, checklist_progress, custom_message }`
2. Copy draft_text (response)
3. Open `deep_link` (t.me/@handle) in new tab — nếu deep_link null: chỉ copy, toast "Copy thành công (user chưa có TG handle)"
4. Append bubble vào chat history

---

#### `MyWorkView.tsx`

**Header:** "Việc của tôi — [IT member name]"  
**3 groups:**
- "🟠 Đang xử lý" — status = 'in_progress', sorted SLA ASC
- "🟣 Mới nhận" — status = 'assigned', sorted created_at ASC
- "✅ Done hôm nay" — status = 'done', max 3 items

**Empty state:** "Chưa có ticket nào 🎉" + "Xem Inbox →" button

**`WorkCard.tsx`:**
```
[severity colored border-left] [title] [status pill] [SLA countdown]
[URL chip monospace] [Component] [Checklist mini-bar X/Y]
Quick actions: [▶ Start] [✓ Done] [📱 Telegram] [📋 Checklist]
```
**Click card body:** `switchView('inbox'); selectTicket(id)`  
**Click "Checklist":** `switchView('inbox'); selectTicket(id); setTab('checklist')`

---

## 8. SHARED COMPONENTS

### Dùng chung cho cả 2 portals

| Component | Mô tả |
|---|---|
| `AuthGuard.tsx` | Wrap toàn app. Nếu không có session → redirect Google OAuth. IT Ops thêm role check → `<ForbiddenPage />` nếu role không đủ |
| `LoginPage.tsx` | "Đăng nhập bằng Google" button → `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| `Toast.tsx` | Portal-based toast, tự dismiss 3s. `useToast()` hook: `toast.success()`, `toast.error()`, `toast.info()` |
| `ErrorBoundary.tsx` | Wrap app, hiện friendly error page, "Tải lại trang" button |
| `supabase.ts` | `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` — singleton |
| `api.ts` | `apiFetch(path, options)`: auto-attach `Authorization: Bearer JWT`, refresh token nếu 401, throw `ErrorResponse` typed |
| `query-client.ts` | `new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })` |
| `useAuth.ts` | `supabase.auth.getSession()` + `onAuthStateChange` subscription, trả về `{ user, session, loading }` |

### Không duplicate

Nếu cần share logic giữa 2 portals trong tương lai → tạo npm private package `@nquoc/shared`. Phase 1: copy types + utils là chấp nhận được vì 2 portals là 2 repo riêng.

---

## 9. AI PROMPTS

### IT Module không có backend AI call.

Claude AI được dùng theo cách sau: **frontend generates structured text prompt** → **user paste thủ công vào claude.ai** → Claude trả về User Story + IT Checklist.

### `buildPrompt()` — output của Claude Prompt Generator

**File:** `src/modules/it-request/utils/prompt-builder.ts`  
**Trigger:** score ≥ 50%, render trong tab "📋 Claude Prompt" ở Step 5

**Output format:**
```
Bạn là System Analyst của NQuoc Platform (NhiLe Holdings).
NQuoc Platform là Work OS nội bộ với các portal:
nquoc.vn | team.nquoc.vn | data.nquoc.vn | api.nquoc.vn | tbot.nquoc.vn

--- THÔNG TIN YÊU CẦU ---
Team: [team.label]
Loại: [requestType.label]
Mức độ: [severity.code] - [severity.label] (SLA: [sla_hours]h)
Component: [archComponent.label]
URL đang lỗi: [affectedUrl || 'Không có']

--- MÔ TẢ VẤN ĐỀ ---
Kỳ vọng: [expectedBehavior]
Thực tế: [actualBehavior]
Tái diễn: [reproduced || 'Không rõ']

--- TRẢ LỜI PHỎNG VẤN ---
[answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')]

--- MÔI TRƯỜNG ---
[env.browser] / [env.os] / [env.screen]

--- YÊU CẦU ---
1. Viết User Story theo format "As a... I want... So that..."
2. Liệt kê 5-8 bước IT cần kiểm tra để debug (debug checklist)
3. Đề xuất mức độ phức tạp: Dễ / Trung bình / Khó và lý do tại sao
```

**Guardrails:**
- Không bao giờ include thông tin cá nhân nhạy cảm ngoài tên + TG handle
- Truncate `expectedBehavior` và `actualBehavior` nếu > 500 chars

---

## 10. BUILD ORDER

### Sprint 1 — Foundation & Database ✦ Bắt đầu ở đây

**Deliverables:**
1. Tạo Supabase project NQuoc Platform (nếu chưa có)
2. Chạy migration 001 → 002 → 003 → 004 (`supabase db push`)
3. Verify seed data: `SELECT * FROM it_severity_levels ORDER BY sort_order;`
4. Init `nquoc-backend` repo: `bun init`, install `hono`, `postgres`, `zod`, `@supabase/supabase-js`
5. Tạo `src/shared/db.ts` — connection pool với `DATABASE_URL`
6. Tạo `src/shared/jwt.ts` — `verifySupabaseJWT()` dùng `SUPABASE_JWT_SECRET`
7. Tạo `src/shared/errors.ts` — `AppError` class + error codes
8. `src/index.ts` — Hono app khởi động, health check `GET /health → { ok: true }`
9. Xác nhận `bun run dev` chạy không lỗi

**Dependency trước khi qua Sprint 2:** Schema OK + Backend server chạy được

---

### Sprint 2 — Backend API: Lookup + IT Request Portal

**Deliverables:**
1. `lookup.repo.ts` — SQL queries cho severity, teams, requestTypes (JOIN questions + slots)
2. `lookup.controller.ts` + `lookup.routes.ts`
3. Test: `GET /api/v1/it/lookup/severity-levels` → 4 items
4. `create-ticket.validator.ts` — Zod schema
5. `ticket.repo.ts` — `insert()` (tính `sla_deadline_at` = `created_at + sla_hours`)
6. `checklist.service.ts` — `snapshotChecklist(ticketId, requestTypeId)`: INSERT checklist_items từ template
7. `events.repo.ts` — `insertEvent()`
8. `brief-builder.service.ts` — build IT Brief text
9. `it-request.controller.ts` → `createTicket()`: validate → insert ticket → snapshot checklist → insert event → build brief → response 201
10. `ticket.repo.ts` → `findMyTickets(submitterId, cursor, limit, status?)`
11. `findById(id, submitterId)` — check ownership (throw NOT_FOUND nếu không phải chủ)
12. `cancelTicket(id, submitterId)` — check status='new', update → cancelled, insert event
13. Routes + controllers cho GET/DELETE `/it/my-tickets`
14. Test toàn bộ với Postman hoặc `curl`

**Dependency trước khi qua Sprint 3:** Lookup + IT Request endpoints OK

---

### Sprint 3 — Backend API: IT Ops Portal

**Deliverables:**
1. `auth.middleware.ts` + `role.middleware.ts` — extract JWT + check role
2. `ticket.repo.ts` → `findInbox(cursor, limit, teamCode?)` — status='new', sort severity+SLA
3. `ticket.repo.ts` → `findMyWork(itUserId)` — assigned_to=me, status IN (assigned, in_progress, pending_info, done)
4. `ticket.repo.ts` → `findByIdForIT(id)` — full TicketDetail với submitter_tg
5. `claimTicket(id, itUserId)` — `SELECT FOR UPDATE` → check status='new' → update → insert event → return ticket + telegram_draft
6. `updateStatus(id, itUserId, newStatus, note?)` — validate transition → update → insert event (+ note nếu có)
7. `checklist.repo.ts` → `getByTicketId()`, `updateItem()`
8. `activity.service.ts` → merge ticket_events + notes → `ActivityItem[]`
9. `notes.service.ts` → `addNote()`
10. `telegram-draft.service.ts` → `buildDraft(templateType, ticket, progress?)` — 4 templates
11. Routes + controllers cho tất cả IT Ops endpoints
12. Test toàn bộ với mock JWT từ Supabase test

**Dependency trước khi qua Sprint 4:** Tất cả 17 endpoints hoạt động

---

### Sprint 4 — IT Request Portal Frontend (`nquoc-it-request`)

**Deliverables:**
1. `bun create vite nquoc-it-request --template react-ts`
2. Install: `tailwindcss`, `@tanstack/react-query`, `zustand`, `msw`, `@supabase/supabase-js`, `shadcn/ui`
3. Configure Tailwind, Playfair Display + Inter font
4. `shared/lib/supabase.ts`, `api.ts`, `query-client.ts`
5. `shared/components/AuthGuard.tsx`, `LoginPage.tsx`, `Toast.tsx`
6. `shared/hooks/useAuth.ts`
7. `mocks/handlers/it-request.handlers.ts` — mock tất cả lookup + create ticket
8. `wizard.store.ts` — Zustand state + INIT + reset()
9. `wizard.types.ts`
10. `utils/score.ts`, `gate.ts`, `brief-builder.ts`, `prompt-builder.ts`, `env-detect.ts`
11. `useLookupData.ts` — fetch teams + severity + requestTypes (cache 5min)
12. `WizardTimeline.tsx`, `ScoreBar.tsx`, `GatePanel.tsx`
13. `Step1Team.tsx` → `Step5Upload.tsx` — từng step theo spec Section 7A
14. `SendModal.tsx` + `useSubmitTicket.ts`
15. `SuccessPage.tsx`
16. `ITRequestPage.tsx` — wire tất cả
17. `App.tsx` + `router.tsx` + `main.tsx` với MSW
18. Test flow đầy đủ: Step 1 → Step 6 → Edit → Delete → New với mock
19. Toggle service layer: `VITE_ENV=production` → call real backend

**Dependency trước khi qua Sprint 5:** IT Request Portal demo-able với MSW

---

### Sprint 5 — IT Ops Portal Frontend (`nquoc-it-ops`)

**Deliverables:**
1. `bun create vite nquoc-it-ops --template react-ts`
2. Install same dependencies
3. `shared/` — copy từ IT Request Portal, thêm `ForbiddenPage.tsx`
4. `AuthGuard.tsx` IT Ops version: thêm role check sau session check
5. `mocks/handlers/it-ops.handlers.ts` — mock inbox, my-work, detail, claim, status, checklist, activity, notes, notify
6. `ops.store.ts` — Zustand: selectedTicketId, currentView ('inbox'|'mywork'), filter, search, telegramPanelOpen
7. `ops.types.ts`
8. `utils/sla.ts`, `telegram-builder.ts`
9. `OpsHeader.tsx` — nav tabs + badges
10. `InboxView.tsx` — MetricsBar + P0AlertBanner + FilterChips + SearchBar + TicketList
11. `TicketRow.tsx` — row với URL chip + SLA bar + hover actions
12. `DetailPanel.tsx` — header + workflow bar + 3 tabs
13. `OverviewTab.tsx`, `ChecklistTab.tsx`, `ActivityTab.tsx`
14. `UrlDisplay.tsx`, `WorkflowBar.tsx`
15. `ClaimModal.tsx` với claim animation
16. `TelegramPanel.tsx` + `TemplateChips.tsx`
17. `MyWorkView.tsx` + `WorkCard.tsx`
18. `useKeyboardShortcuts.ts` — J/K navigate, / focus search, ⌘K palette, ? help, Shift+T claim
19. `CommandPalette.tsx` — ⌘K overlay
20. `ITOpsDashboardPage.tsx` — wire tất cả
21. Test flow: Login → Inbox → Claim → My Work → Checklist → Telegram với mock
22. Toggle service layer: call real backend

**Dependency trước khi qua Sprint 6:** IT Ops Portal demo-able với MSW

---

### Sprint 6 — Integration & Deploy

**Deliverables:**
1. End-to-end test: User gửi (IT Request) → IT nhận (IT Ops inbox) → Claim → Update → Done
2. Test race condition: 2 IT cùng claim 1 ticket → 409 handling
3. Loading states: skeleton UI cho tất cả data-fetching components
4. Error states: retry button, friendly message tiếng Việt
5. Empty states: inbox trống, my-work trống, no tickets
6. Responsive: IT Request Portal mobile-first check
7. Deploy `nquoc-backend` — `bunx vercel --prod` hoặc Railway/Render
8. Deploy `nquoc-it-request` → Vercel → custom domain `dashboard.it.nquoc.vn`
9. Deploy `nquoc-it-ops` → Vercel → custom domain `it.nquoc.vn`
10. Supabase Auth: thêm redirect URLs:
    - `https://dashboard.it.nquoc.vn/**`
    - `https://it.nquoc.vn/**`
11. CORS config backend: allow origins `dashboard.it.nquoc.vn`, `it.nquoc.vn`
12. Smoke test production

---

## 11. ENVIRONMENT VARIABLES

### `nquoc-it-request/.env`

```bash
# Required
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[supabase-anon-key]
VITE_API_BASE_URL=https://api.nquoc.vn/api/v1

# Build mode: 'development' enables MSW mock, 'production' calls real API
VITE_ENV=development
```

### `nquoc-it-ops/.env`

```bash
# Required
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[supabase-anon-key]
VITE_API_BASE_URL=https://api.nquoc.vn/api/v1

VITE_ENV=development
```

### `nquoc-backend/.env`

```bash
# Required — crash on startup nếu thiếu
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
SUPABASE_JWT_SECRET=[jwt-secret-from-supabase-dashboard]
PORT=8080

# Optional — Phase 2 Telegram auto-send
# Nếu không có: POST /notify vẫn hoạt động, sent=false, draft_text build OK
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=

# Optional — Email backup
OPTIONAL_SMTP_HOST=
OPTIONAL_SMTP_PORT=
OPTIONAL_SMTP_USER=
OPTIONAL_SMTP_PASS=
```

**Startup validation (backend `src/index.ts`):**
```typescript
const REQUIRED_ENV = ['DATABASE_URL', 'SUPABASE_JWT_SECRET', 'PORT'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required env var: ${key}`);
    process.exit(1);
  }
}
// Optional env: log warning only, không crash
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn('WARN: TELEGRAM_BOT_TOKEN not set. Telegram auto-send disabled (Phase 2 feature).');
}
```

---

## 12. CÂU LỆNH MỞ ĐẦU CHO CLAUDE CODE

Paste câu lệnh này vào Claude Code sau khi đặt file CLAUDE.md vào root folder của từng project:

### Cho Backend (`nquoc-backend`):

```
Đọc CLAUDE.md.

Build NQuoc IT Module Backend theo đúng spec.
Bắt đầu Sprint 1: khởi tạo Bun project + tạo toàn bộ SQL migration files (001-004) + shared db/jwt/errors + health check endpoint.

Khi Sprint 1 xong:
1. List tất cả files đã tạo
2. Chạy `bun run dev` — báo lỗi nếu có
Tôi confirm OK rồi mới qua Sprint 2.
```

### Cho IT Request Portal (`nquoc-it-request`):

```
Đọc CLAUDE.md.

Build IT Request Portal theo đúng spec.
Backend chưa ready — dùng MSW mock toàn bộ.
Bắt đầu Sprint 4: init Vite + install dependencies + shared components + wizard store + utils.
Không build step components trước khi store và utils xong.

Khi Sprint 4 step 1-9 xong:
1. List files đã tạo
2. Chạy `bun run dev` — portal phải load được login page
Tôi confirm OK rồi mới build các Step components.
```

### Cho IT Ops Portal (`nquoc-it-ops`):

```
Đọc CLAUDE.md.

Build IT Ops Portal theo đúng spec.
Backend chưa ready — dùng MSW mock toàn bộ.
Bắt đầu Sprint 5: init Vite + shared components (với ForbiddenPage) + ops store + utils.
Desktop-first layout: left panel 420px fixed + right detail panel flex-1.

Khi Sprint 5 step 1-8 xong:
1. List files đã tạo
2. Chạy `bun run dev` — portal phải load được login page và Inbox skeleton
Tôi confirm OK rồi build các view components.
```

---

## CHECKLIST TRƯỚC KHI HANDOFF

```
□ Supabase project NQuoc Platform đã tạo
□ Google OAuth đã config trong Supabase Auth (Google Workspace)
□ Redirect URLs đã thêm: dashboard.it.nquoc.vn + it.nquoc.vn
□ DATABASE_URL có trong .env (backend)
□ SUPABASE_JWT_SECRET có trong .env (backend)
□ VITE_SUPABASE_URL + ANON_KEY có trong .env (2 frontends)
□ Seed data đã chạy (4 severity levels, teams, request types)
□ IT Leader đã cấu hình checklist templates trong DB
□ user_roles: IT team đã được assign role it_member / it_leader
```

---

## ASSUMPTIONS ĐÃ CONFIRM (Business Owner)

| # | Assumption | Status |
|---|---|---|
| 1 | Tất cả nhân viên NhiLe có Google Workspace → chỉ build Google OAuth | ✅ Confirmed |
| 2 | Cancel ticket chỉ khi status='new' → 409 sau khi claimed | ✅ Confirmed |
| 3 | Ticket tự tạo trong DB khi user submit (không chỉ build brief) | ✅ Confirmed |
| 4 | Domain IT Request: `dashboard.it.nquoc.vn` · IT Ops: `it.nquoc.vn` | ✅ Confirmed |
| 5 | Analytics chỉ Phase 3 — không scope trong CLAUDE.md này | ✅ Confirmed |
| 6 | Không re-open sau Verified → user tạo ticket mới | ✅ Confirmed |
| 7 | submitter_tg optional — deep_link null nếu không có | ✅ Confirmed |
| 8 | TELEGRAM_BOT_TOKEN optional Phase 1 — POST /notify build draft, sent=false | ✅ Confirmed |

---

*NL-CLAUDE-IT-001 v1.0 · NhiLe Holdings · NQuoc Platform · IT Module · Tháng 4/2026*
*"Xây để phụng sự — không phải để tồn tại."*
