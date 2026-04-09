import { useMutation } from '@tanstack/react-query';
import type { CreateTicketBody, TicketSummary } from '@/shared/types/api.types';
import { apiFetch } from '@/shared/lib/api';

interface SubmitTicketResponse {
  data: {
    ticket: TicketSummary;
    it_brief: string;
  };
}

export function useSubmitTicket() {
  return useMutation({
    mutationFn: (body: CreateTicketBody) =>
      apiFetch<SubmitTicketResponse>('/it/tickets', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
}
