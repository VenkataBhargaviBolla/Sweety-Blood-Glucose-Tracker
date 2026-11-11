import {
  User,
  Reading,
  DailyReport,
  MonthToDateReport,
  MonthlyReport,
  PaginatedReadings,
  TimeSlot,
} from '../types.ts';

const TOKEN_KEY = 'sweety_auth_token';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clearToken: (): void => localStorage.removeItem(TOKEN_KEY),
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ error: 'Invalid JSON response from server' }));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string, role: 'patient' | 'doctor' = 'patient') =>
    apiRequest<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  login: (email: string, password: string) =>
    apiRequest<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => apiRequest<{ user: User }>('/api/auth/me'),

  // Readings
  getReadings: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    patientId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.patientId) searchParams.append('patientId', params.patientId);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<PaginatedReadings>(`/api/readings${query}`);
  },

  createReading: (reading: {
    date: string;
    timeSlot: TimeSlot;
    value: number;
    notes?: string;
  }) =>
    apiRequest<{ message: string; reading: Reading }>('/api/readings', {
      method: 'POST',
      body: JSON.stringify(reading),
    }),

  updateReading: (
    id: string,
    reading: {
      date: string;
      timeSlot: TimeSlot;
      value: number;
      notes?: string;
    }
  ) =>
    apiRequest<{ message: string; reading: Reading }>(`/api/readings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reading),
    }),

  deleteReading: (id: string) =>
    apiRequest<{ message: string; id: string }>(`/api/readings/${id}`, {
      method: 'DELETE',
    }),

  // Reports
  getDailyReport: (date: string, patientId?: string) => {
    const query = patientId ? `?date=${date}&patientId=${patientId}` : `?date=${date}`;
    return apiRequest<DailyReport>(`/api/reports/daily${query}`);
  },

  getMonthToDateReport: (date: string, patientId?: string) => {
    const query = patientId ? `?date=${date}&patientId=${patientId}` : `?date=${date}`;
    return apiRequest<MonthToDateReport>(`/api/reports/month-to-date${query}`);
  },

  getMonthlyReport: (date: string, patientId?: string) => {
    const query = patientId ? `?date=${date}&patientId=${patientId}` : `?date=${date}`;
    return apiRequest<MonthlyReport>(`/api/reports/monthly${query}`);
  },

  // Patients (Doctor only)
  getPatients: () =>
    apiRequest<{ patients: { id: string; name: string; email: string; readingsCount: number }[] }>(
      '/api/patients'
    ),

  // Seed demo data
  seedDemo: () =>
    apiRequest<{ message: string; demoEmail: string; readingsCount: number }>('/api/seed', {
      method: 'POST',
    }),
};
