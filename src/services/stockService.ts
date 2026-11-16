import type { PageResponse } from '../types/api';
import type { ProductVariant } from '../types/reports';
import api from './api';

export const stockService = {
  async getLowStock(
    { page = 1, size = 5 }: { page?: number; size?: number } = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<ProductVariant>> {
    const { data } = await api.get<PageResponse<ProductVariant>>('/stock-movements/low-stock', {
      params: { page: page - 1, size },
      signal,
    });
    return data;
  },
};
