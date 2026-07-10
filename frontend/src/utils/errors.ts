import { ApiError } from '../types/api';

export function errorTitle(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'Backend no disponible';
    if (error.status === 409) return 'Conflicto de estado';
    if (error.status === 504) return 'Timeout del comando';
    if (error.status >= 500) return 'Error del backend';
    return 'Solicitud inválida';
  }
  if (error instanceof TypeError) return 'Backend no disponible';
  return 'Error inesperado';
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return 'No se pudo conectar con la API.';
  if (error instanceof Error) return error.message;
  return 'No se pudo completar la operación.';
}

export function technicalDetails(error: unknown): string {
  if (error instanceof ApiError) return JSON.stringify({ status: error.status, code: error.code, details: error.details }, null, 2);
  if (error instanceof Error) return error.stack || error.message;
  return JSON.stringify(error, null, 2);
}
