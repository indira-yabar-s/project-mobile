import type { PageResponse } from '../types/api';
import type { SalesOrder } from '../types/sales';
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
  ): Promise<PageResponse<SalesOrder>> {
    const { data } = await api.get<PageResponse<SalesOrder>>('/sales-orders', {
      params: { page: page - 1, size, sort, desde, hasta },
      signal,
    });
    return data;
  },

  async getById(id: number, signal?: AbortSignal): Promise<SalesOrder> {
    const { data } = await api.get<SalesOrder>(`/sales-orders/${id}`, { signal });
    return data;
  },
};
