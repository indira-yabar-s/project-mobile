import type { EmployeePayload, PageResponse, User } from '../types/api';
import api from './api';

interface UserListParams {
  page?: number;
  size?: number;
}

export const userService = {
  async getAll({ page = 1, size = 20 }: UserListParams = {}, signal?: AbortSignal): Promise<PageResponse<User>> {
    const { data } = await api.get<PageResponse<User>>('/users', {
      params: { page: page - 1, size, sort: 'nombre,asc' },
      signal,
    });
    return data;
  },

  async createEmployee({ nombre, email, password }: EmployeePayload): Promise<User> {
    const { data } = await api.post<User>('/users', { nombre, email, password, role: 'EMPLEADO' });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
