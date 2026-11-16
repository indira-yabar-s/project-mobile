import type { PageResponse } from '../types/api';
import type { PurchaseOrder, PurchaseOrderPayload } from '../types/purchases';
import api from './api';

interface PurchaseListParams {
  page?: number;
  size?: number;
  sort?: string;
  desde?: string;
  hasta?: string;
}

export const purchaseService = {
  async getAll(
    { page = 1, size = 10, sort = 'fechaEmision,desc', desde, hasta }: PurchaseListParams = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<PurchaseOrder>> {
    const { data } = await api.get<PageResponse<PurchaseOrder>>('/purchase-orders', {
      params: { page: page - 1, size, sort, desde, hasta },
      signal,
    });
    return data;
  },

  async getById(id: number, signal?: AbortSignal): Promise<PurchaseOrder> {
    const { data } = await api.get<PurchaseOrder>(`/purchase-orders/${id}`, { signal });
    return data;
  },

  async create(payload: PurchaseOrderPayload): Promise<PurchaseOrder> {
    const { data } = await api.post<PurchaseOrder>('/purchase-orders', payload);
    return data;
  },
};
