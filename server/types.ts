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
  passwordHash: string;
  role: 'patient' | 'doctor';
  createdAt: string;
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
  average: number | null; // rounded to 1 decimal
}

export interface DailyReportResponse extends ReportMetrics {
  date: string;
  readings: Reading[];
}

export interface RangeReportResponse extends ReportMetrics {
  rangeName: string;
  startDate: string;
  endDate: string;
  readings: Reading[];
}
