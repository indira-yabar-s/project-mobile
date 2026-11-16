import type { PageResponse } from '../types/api';
import api from './api';

interface ProductListParams {
  page?: number;
  size?: number;
  sort?: string;
  soloActivos?: boolean;
  search?: string;
}

export const productService = {
  async getAll(
    { page = 1, size = 10, sort = 'nombre,asc', soloActivos = true, search = '' }: ProductListParams = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<unknown>> {
    const { data } = await api.get<PageResponse<unknown>>('/products', {
      params: { page: page - 1, size, sort, soloActivos, search: search || undefined },
      signal,
    });
    return data;
  },
};
