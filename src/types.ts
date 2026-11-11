export type TimeSlot =
  | 'Morning (fasting)'
  | 'After breakfast'
  | 'After lunch'
  | 'After dinner';

export const TIME_SLOTS: TimeSlot[] = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
}

export interface Reading {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  timeSlot: TimeSlot;
  value: number; // in mg/dl
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportMetrics {
  count: number;
  highest: number | null;
  lowest: number | null;
  average: number | null;
}

export interface DailyReport extends ReportMetrics {
  reportType: 'daily';
  date: string;
  readings: Reading[];
}

export interface MonthToDateReport extends ReportMetrics {
  reportType: 'month-to-date';
  startDate: string;
  endDate: string;
  selectedDate: string;
  readings: Reading[];
}

export interface MonthlyReport extends ReportMetrics {
  reportType: 'monthly';
  previousMonth: string;
  startDate: string;
  endDate: string;
  selectedDate: string;
  readings: Reading[];
}

export interface PaginatedReadings {
  readings: Reading[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
