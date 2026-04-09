import { useQuery } from '@tanstack/react-query';
import type { SeverityLevel, Team, RequestType, ApiResponse } from '@/shared/types/api.types';
import { apiFetch } from '@/shared/lib/api';

export function useSeverityLevels() {
  return useQuery({
    queryKey: ['it', 'severity-levels'],
    queryFn: () => apiFetch<ApiResponse<SeverityLevel[]>>('/it/lookup/severity-levels'),
    staleTime: 5 * 60 * 1000, // 5 min cache
    select: (data) => data.data,
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ['it', 'teams'],
    queryFn: () => apiFetch<ApiResponse<Team[]>>('/it/lookup/teams'),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useRequestTypes() {
  return useQuery({
    queryKey: ['it', 'request-types'],
    queryFn: () => apiFetch<ApiResponse<RequestType[]>>('/it/lookup/request-types'),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });
}
