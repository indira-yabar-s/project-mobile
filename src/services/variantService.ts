import type { PageResponse } from '../types/api';
import type { ProductVariant, VariantPayload } from '../types/products';
import api from './api';

export const variantService = {
  async getByProduct(
    productId: number,
    { page = 1, size = 10, sort = 'id,asc' }: { page?: number; size?: number; sort?: string } = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<ProductVariant>> {
    const { data } = await api.get<PageResponse<ProductVariant>>(`/products/${productId}/variants`, {
      params: { page: page - 1, size, sort },
      signal,
    });
    return data;
  },

  async create(productId: number, payload: VariantPayload): Promise<ProductVariant> {
    const { data } = await api.post<ProductVariant>(`/products/${productId}/variants`, payload);
    return data;
  },

  async update(variantId: number, payload: VariantPayload): Promise<ProductVariant> {
    const { data } = await api.put<ProductVariant>(`/variants/${variantId}`, payload);
    return data;
  },
};
