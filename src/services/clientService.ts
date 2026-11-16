import type { PageParams, PageResponse } from '../types/api';
import api from './api';

export const clientService = {
  async getAll(
    { page = 1, size = 10, sort = 'nombre,asc', search = '' }: PageParams = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<unknown>> {
    const { data } = await api.get<PageResponse<unknown>>('/clients', {
      params: { page: page - 1, size, sort, search: search || undefined },
      signal,
    });
    return data;
  },
};
