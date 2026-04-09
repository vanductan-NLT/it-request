import { apiFetch } from '@/shared/lib/api';
import type {
  ApiResponse,
  ListResponse,
  SeverityLevel,
  Team,
  RequestType,
  TicketSummary,
  TicketDetail,
  CreateTicketBody,
} from '@/shared/types/api.types';

export const itRequestService = {
  getSeverityLevels: () =>
    apiFetch<ApiResponse<SeverityLevel[]>>('/it/lookup/severity-levels'),

  getTeams: () =>
    apiFetch<ApiResponse<Team[]>>('/it/lookup/teams'),

  getRequestTypes: () =>
    apiFetch<ApiResponse<RequestType[]>>('/it/lookup/request-types'),

  createTicket: (body: CreateTicketBody) =>
    apiFetch<{ data: { ticket: TicketSummary; it_brief: string } }>('/it/tickets', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMyTickets: (params?: { after?: string; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.after) searchParams.set('after', params.after);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return apiFetch<ListResponse<TicketSummary>>(`/it/my-tickets${qs ? `?${qs}` : ''}`);
  },

  getMyTicket: (id: string) =>
    apiFetch<ApiResponse<TicketDetail>>(`/it/my-tickets/${id}`),

  cancelMyTicket: (id: string) =>
    apiFetch<ApiResponse<{ id: string; status: 'cancelled' }>>(`/it/my-tickets/${id}`, {
      method: 'DELETE',
    }),
};
