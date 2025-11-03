export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export function ok<T = unknown>(data?: T, message = 'OK'): ApiResponse<T> {
  return { success: true, message, data };
}

export function fail<T = unknown>(message = 'Error', data?: T): ApiResponse<T> {
  return { success: false, message, data };
}
