import type { PageResponse } from '../types/api';
import type { Category, CategoryPayload } from '../types/products';
import api from './api';

interface CategoryListParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export const categoryService = {
  async getAll({ size = 100 }: { size?: number } = {}, signal?: AbortSignal): Promise<Category[]> {
    const { data } = await api.get<PageResponse<Category>>('/categories', {
      params: { size, sort: 'nombre,asc' },
      signal,
    });
    return data.content;
  },

  async getPage(
    { page = 1, size = 10, sort = 'nombre,asc', search = '' }: CategoryListParams = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<Category>> {
    const { data } = await api.get<PageResponse<Category>>('/categories', {
      params: { page: page - 1, size, sort, search: search || undefined },
      signal,
    });
    return data;
  },

  async getById(id: number, signal?: AbortSignal): Promise<Category> {
    const { data } = await api.get<Category>(`/categories/${id}`, { signal });
    return data;
  },

  async create(payload: CategoryPayload): Promise<Category> {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },

  async update(id: number, payload: CategoryPayload): Promise<Category> {
    const { data } = await api.put<Category>(`/categories/${id}`, payload);
    return data;
  },

  async deactivate(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
