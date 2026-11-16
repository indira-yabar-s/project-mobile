import type { PageResponse } from '../types/api';
import type { Product, ProductPayload } from '../types/products';
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
  ): Promise<PageResponse<Product>> {
    const { data } = await api.get<PageResponse<Product>>('/products', {
      params: { page: page - 1, size, sort, soloActivos, search: search || undefined },
      signal,
    });
    return data;
  },

  async getById(id: number, signal?: AbortSignal): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`, { signal });
    return data;
  },

  async create(payload: ProductPayload): Promise<Product> {
    const { data } = await api.post<Product>('/products', payload);
    return data;
  },

  async update(id: number, payload: ProductPayload): Promise<Product> {
    const { data } = await api.put<Product>(`/products/${id}`, payload);
    return data;
  },

  async patch(id: number, payload: Partial<Pick<ProductPayload, 'precioVenta'>>): Promise<Product> {
    const { data } = await api.patch<Product>(`/products/${id}`, payload);
    return data;
  },

  async deactivate(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
