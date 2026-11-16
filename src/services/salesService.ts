import type { PageResponse } from '../types/api';
import api from './api';

interface SalesListParams {
  page?: number;
  size?: number;
  sort?: string;
  desde?: string;
  hasta?: string;
}

export const salesService = {
  async getAll(
    { page = 1, size = 10, sort = 'fechaEmision,desc', desde, hasta }: SalesListParams = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<unknown>> {
    const { data } = await api.get<PageResponse<unknown>>('/sales-orders', {
      params: { page: page - 1, size, sort, desde, hasta },
      signal,
    });
    return data;
  },
};
