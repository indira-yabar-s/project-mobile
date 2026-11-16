export type Role = 'ADMIN' | 'EMPLEADO';

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: Role;
  empresaId: number;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  enterpriseId: number;
}

export interface Enterprise {
  id: number;
  ruc: string;
  razonSocial: string;
  fechaRegistro: string;
}

export interface CreateEnterprisePayload {
  ruc: string;
  razonSocial: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  timestamp?: string;
}
