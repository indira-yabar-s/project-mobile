import type { PageResponse } from '../types/api';
import type { ProductVariant, StockMovement } from '../types/products';
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

  async registerInbound(payload: { varianteId: number; cantidad: number; motivo: string | null }): Promise<StockMovement> {
    const { data } = await api.post<StockMovement>('/stock-movements/inbound', payload);
    return data;
  },

  async registerAdjustment(payload: {
    varianteId: number;
    nuevoStock: number;
    motivo: string | null;
  }): Promise<StockMovement> {
    const { data } = await api.post<StockMovement>('/stock-movements/adjustments', payload);
    return data;
  },
};
