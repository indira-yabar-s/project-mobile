import type { PageResponse } from '../types/api';
import type { Category } from '../types/products';
import api from './api';

export const categoryService = {
  async getAll({ size = 100 }: { size?: number } = {}, signal?: AbortSignal): Promise<Category[]> {
    const { data } = await api.get<PageResponse<Category>>('/categories', {
      params: { size, sort: 'nombre,asc' },
      signal,
    });
    return data.content;
  },
};
