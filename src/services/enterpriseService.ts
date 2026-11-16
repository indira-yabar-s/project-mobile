import type { CreateEnterprisePayload, Enterprise } from '../types/api';
import api from './api';

export const enterpriseService = {
  async create(payload: CreateEnterprisePayload): Promise<Enterprise> {
    const { data } = await api.post<Enterprise>('/enterprises', payload);
    return data;
  },
};
