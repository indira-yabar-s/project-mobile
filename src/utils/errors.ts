import axios from 'axios';
import type { ApiProblem } from '../types/api';

const MESSAGES_BY_STATUS: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Revisa el formulario.',
  401: 'Tu sesión expiró o tus credenciales son incorrectas.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No encontramos lo que buscas.',
  408: 'La solicitud tardó demasiado. Intenta de nuevo.',
  409: 'Esta operación entra en conflicto con información existente.',
  413: 'Los datos enviados son demasiado grandes.',
  422: 'Los datos enviados no se pudieron procesar. Revisa el formulario.',
  429: 'Alcanzaste el límite de consultas. Intenta más tarde.',
  500: 'Ocurrió un error en el servidor. Intenta nuevamente.',
  502: 'El servidor no está respondiendo bien. Intenta en unos minutos.',
  503: 'El servicio no está disponible por ahora.',
  504: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
};

const UNEXPECTED_MESSAGE = 'Ocurrió un error inesperado.';
const TIMEOUT_MESSAGE = 'La solicitud tardó demasiado. Intenta de nuevo.';
const NETWORK_MESSAGE = 'No hay conexión con el servidor. Revisa tu internet.';
const TIMEOUT_CODES = new Set(['ECONNABORTED', 'ETIMEDOUT']);

export type ErrorKind = 'network' | 'timeout' | 'auth' | 'forbidden' | 'notFound' | 'client' | 'server' | 'unknown';

export const getErrorKind = (error: unknown): ErrorKind => {
  if (!axios.isAxiosError(error)) return 'unknown';
  if (error.code && TIMEOUT_CODES.has(error.code)) return 'timeout';
  if (!error.response) return 'network';

  const { status } = error.response;
  if (status === 401) return 'auth';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 408 || status === 504) return 'timeout';
  if (status >= 500) return 'server';
  if (status >= 400) return 'client';
  return 'unknown';
};

export const getErrorMessage = (error: unknown): string | null => {
  if (axios.isCancel(error)) return null;
  if (!axios.isAxiosError<ApiProblem>(error)) return UNEXPECTED_MESSAGE;

  const kind = getErrorKind(error);
  if (kind === 'timeout' && !error.response) return TIMEOUT_MESSAGE;
  if (kind === 'network') return NETWORK_MESSAGE;

  const { status, data } = error.response ?? { status: 0, data: undefined };
  const isClientError = status >= 400 && status < 500;
  if (isClientError && data?.detail) return data.detail;

  if (MESSAGES_BY_STATUS[status]) return MESSAGES_BY_STATUS[status];
  if (status >= 500) return MESSAGES_BY_STATUS[500];
  if (isClientError) return MESSAGES_BY_STATUS[400];

  return UNEXPECTED_MESSAGE;
};
