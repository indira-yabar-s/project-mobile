import type { PageResponse } from '../types/api';
import type { AssistantAnswer, AssistantHistoryEntry } from '../types/assistant';
import api from './api';

export const assistantService = {
  async ask(pregunta: string): Promise<AssistantAnswer> {
    const { data } = await api.post<AssistantAnswer>('/assistant', { pregunta }, { timeout: 120000 });
    return data;
  },

  async getHistory(
    { page = 1, size = 20 }: { page?: number; size?: number } = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<AssistantHistoryEntry>> {
    const { data } = await api.get<PageResponse<AssistantHistoryEntry>>('/assistant/history', {
      params: { page: page - 1, size },
      signal,
    });
    return data;
  },
};
