import type { PageParams, PageResponse } from '../types/api';
import type { Client, ClientPayload } from '../types/clients';
import api from './api';

export const clientService = {
  async getAll(
    { page = 1, size = 10, sort = 'nombre,asc', search = '' }: PageParams = {},
    signal?: AbortSignal,
  ): Promise<PageResponse<Client>> {
    const { data } = await api.get<PageResponse<Client>>('/clients', {
      params: { page: page - 1, size, sort, search: search || undefined },
      signal,
    });
    return data;
  },

  async getById(id: number, signal?: AbortSignal): Promise<Client> {
    const { data } = await api.get<Client>(`/clients/${id}`, { signal });
    return data;
  },

  async create(payload: ClientPayload): Promise<Client> {
    const { data } = await api.post<Client>('/clients', payload);
    return data;
  },

  async update(id: number, payload: ClientPayload): Promise<Client> {
    const { data } = await api.put<Client>(`/clients/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  },
};
