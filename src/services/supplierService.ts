import type { PageResponse } from '../types/api';
import type { Supplier, SupplierPayload } from '../types/purchases';
import api from './api';

interface SupplierListParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export const supplierService = {
  async getAll(
    { page = 1, size = 10, sort = 'razonSocial,asc', search = '' }: SupplierListParams = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<Supplier>> {
    const { data } = await api.get<PageResponse<Supplier>>('/suppliers', {
      params: { page: page - 1, size, sort, search: search || undefined },
      signal,
    });
    return data;
  },

  async create(payload: SupplierPayload): Promise<Supplier> {
    const { data } = await api.post<Supplier>('/suppliers', payload);
    return data;
  },
};
