import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Reading, ReportMetrics, TimeSlot } from './types.ts';

interface DatabaseSchema {
  users: User[];
  readings: Reading[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sweety.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = { users: [], readings: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, resetting:', err);
    const initial: DatabaseSchema = { users: [], readings: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveDatabase(data: DatabaseSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export class Database {
  private static instance: Database;

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
      Database.instance.initializeDefaults();
    }
    return Database.instance;
  }

  public initializeDefaults(): void {
    const data = loadDatabase();
    if (data.users.length === 0) {
      this.seedDemoData();
    }
  }

  public seedDemoData(): { user: User; readingsCount: number } {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Password123!', salt);

    const demoUser: User = {
      id: 'demo-patient-001',
      name: 'Bolla (Demo Patient)',
      email: 'demo@kenpath.com',
      passwordHash,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };

    const doctorUser: User = {
      id: 'demo-doctor-001',
      name: 'Dr. Kenpath Endocrinologist',
      email: 'doctor@kenpath.com',
      passwordHash,
      role: 'doctor',
      createdAt: new Date().toISOString(),
    };

    const sampleReadings: Reading[] = [];

    // Helper to generate readings for given month
    const generateMonthReadings = (
      year: number,
      month: number, // 1-12
      maxDay: number,
      baseFasting: number,
      basePost: number
    ) => {
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const slots: { slot: TimeSlot; base: number; variance: number }[] = [
        { slot: 'Morning (fasting)', base: baseFasting, variance: 15 },
        { slot: 'After breakfast', base: basePost + 20, variance: 25 },
        { slot: 'After lunch', base: basePost + 25, variance: 30 },
        { slot: 'After dinner', base: basePost + 10, variance: 25 },
      ];

      for (let day = 1; day <= maxDay; day++) {
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const dateStr = `${year}-${monthStr}-${dayStr}`;

        // Add 3 to 4 readings per day
        const numSlots = day % 4 === 0 ? 3 : 4;
        for (let s = 0; s < numSlots; s++) {
          const cfg = slots[s];
          const offset = Math.floor((Math.sin(day * 2.5 + s) + 1) * cfg.variance) - Math.floor(cfg.variance / 2);
          const val = Math.max(75, Math.min(260, Math.round(cfg.base + offset)));

          sampleReadings.push({
            id: `reading-${dateStr}-${s}`,
            userId: demoUser.id,
            date: dateStr,
            timeSlot: cfg.slot,
            value: val,
            notes: s === 0 ? 'Fasting 10 hrs' : s === 2 ? 'After lunch' : undefined,
            createdAt: `${dateStr}T12:00:00.000Z`,
            updatedAt: `${dateStr}T12:00:00.000Z`,
          });
        }
      }
    };

    // 1. Previous month: Sep 2026 (whole month 1 to 30) - matches Kenpath assignment example!
    generateMonthReadings(2026, 9, 30, 105, 135);

    // 2. Month-to-date: Oct 2026 (1 to 15) - exactly matches Kenpath assignment example!
    // On Oct 15, 2026: 110, 145, 160, 130 (Average 136.3 mg/dl as mentioned in assignment)
    generateMonthReadings(2026, 10, 14, 108, 140);
    // Explicit readings for 15 Oct 2026 as per Kenpath assignment spec:
    sampleReadings.push(
      {
        id: 'reading-2026-10-15-0',
        userId: demoUser.id,
        date: '2026-10-15',
        timeSlot: 'Morning (fasting)',
        value: 110,
        notes: 'Fasting 10 hrs',
        createdAt: '2026-10-15T07:30:00.000Z',
        updatedAt: '2026-10-15T07:30:00.000Z',
      },
      {
        id: 'reading-2026-10-15-1',
        userId: demoUser.id,
        date: '2026-10-15',
        timeSlot: 'After breakfast',
        value: 145,
        notes: '2 hrs after oatmeal & berries',
        createdAt: '2026-10-15T10:00:00.000Z',
        updatedAt: '2026-10-15T10:00:00.000Z',
      },
      {
        id: 'reading-2026-10-15-2',
        userId: demoUser.id,
        date: '2026-10-15',
        timeSlot: 'After lunch',
        value: 160,
        notes: '2 hrs after rice & dal',
        createdAt: '2026-10-15T14:30:00.000Z',
        updatedAt: '2026-10-15T14:30:00.000Z',
      },
      {
        id: 'reading-2026-10-15-3',
        userId: demoUser.id,
        date: '2026-10-15',
        timeSlot: 'After dinner',
        value: 130,
        notes: '2 hrs after roti & vegetable soup',
        createdAt: '2026-10-15T21:00:00.000Z',
        updatedAt: '2026-10-15T21:00:00.000Z',
      }
    );

    // 3. Current local time month (Nov 2026: 1 to 10) so today's date also has live sample data
    generateMonthReadings(2026, 11, 10, 104, 138);

    const schema: DatabaseSchema = {
      users: [demoUser, doctorUser],
      readings: sampleReadings,
    };
    saveDatabase(schema);

    return { user: demoUser, readingsCount: sampleReadings.length };
  }

  // User queries
  public getUserByEmail(email: string): User | undefined {
    const data = loadDatabase();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    const data = loadDatabase();
    return data.users.find((u) => u.id === id);
  }

  public getAllPatients(): { id: string; name: string; email: string; readingsCount: number }[] {
    const data = loadDatabase();
    return data.users
      .filter((u) => u.role === 'patient')
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        readingsCount: data.readings.filter((r) => r.userId === u.id).length,
      }));
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const data = loadDatabase();
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    saveDatabase(data);
    return newUser;
  }

  // Reading queries
  public getReadingsByUser(
    userId: string,
    filters?: {
      date?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): { readings: Reading[]; total: number; page: number; limit: number; totalPages: number } {
    const data = loadDatabase();
    let userReadings = data.readings.filter((r) => r.userId === userId);

    if (filters?.date) {
      userReadings = userReadings.filter((r) => r.date === filters.date);
    }
    if (filters?.startDate) {
      userReadings = userReadings.filter((r) => r.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      userReadings = userReadings.filter((r) => r.date <= filters.endDate!);
    }

    // Sort descending by date, then by slot order
    const slotOrder: Record<TimeSlot, number> = {
      'Morning (fasting)': 1,
      'After breakfast': 2,
      'After lunch': 3,
      'After dinner': 4,
    };

    userReadings.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return (slotOrder[a.timeSlot] || 0) - (slotOrder[b.timeSlot] || 0);
    });

    const total = userReadings.length;
    const page = filters?.page && filters.page > 0 ? Number(filters.page) : 1;
    const limit = filters?.limit && filters.limit > 0 ? Number(filters.limit) : 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    const paginated = userReadings.slice(offset, offset + limit);

    return {
      readings: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public getRawReadingsInRange(userId: string, startDate: string, endDate: string): Reading[] {
    const data = loadDatabase();
    const slotOrder: Record<TimeSlot, number> = {
      'Morning (fasting)': 1,
      'After breakfast': 2,
      'After lunch': 3,
      'After dinner': 4,
    };

    return data.readings
      .filter((r) => r.userId === userId && r.date >= startDate && r.date <= endDate)
      .sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return (slotOrder[a.timeSlot] || 0) - (slotOrder[b.timeSlot] || 0);
      });
  }

  public getReadingsByDate(userId: string, date: string): Reading[] {
    const data = loadDatabase();
    const slotOrder: Record<TimeSlot, number> = {
      'Morning (fasting)': 1,
      'After breakfast': 2,
      'After lunch': 3,
      'After dinner': 4,
    };

    return data.readings
      .filter((r) => r.userId === userId && r.date === date)
      .sort((a, b) => (slotOrder[a.timeSlot] || 0) - (slotOrder[b.timeSlot] || 0));
  }

  public getReadingById(id: string, userId?: string): Reading | undefined {
    const data = loadDatabase();
    if (userId) {
      return data.readings.find((r) => r.id === id && r.userId === userId);
    }
    return data.readings.find((r) => r.id === id);
  }

  public createReading(reading: {
    userId: string;
    date: string;
    timeSlot: TimeSlot;
    value: number;
    notes?: string;
  }): Reading {
    const data = loadDatabase();
    const newReading: Reading = {
      id: `read_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: reading.userId,
      date: reading.date,
      timeSlot: reading.timeSlot,
      value: reading.value,
      notes: reading.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.readings.push(newReading);
    saveDatabase(data);
    return newReading;
  }

  public updateReading(
    id: string,
    userId: string,
    updates: {
      date: string;
      timeSlot: TimeSlot;
      value: number;
      notes?: string;
    }
  ): Reading | null {
    const data = loadDatabase();
    const idx = data.readings.findIndex((r) => r.id === id && (r.userId === userId || userId === 'admin'));
    if (idx === -1) {
      return null;
    }

    const updated: Reading = {
      ...data.readings[idx],
      date: updates.date,
      timeSlot: updates.timeSlot,
      value: updates.value,
      notes: updates.notes?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    data.readings[idx] = updated;
    saveDatabase(data);
    return updated;
  }

  public deleteReading(id: string, userId?: string): boolean {
    const data = loadDatabase();
    const prevLen = data.readings.length;
    data.readings = data.readings.filter((r) => {
      if (r.id !== id) return true;
      if (userId && r.userId !== userId) return true;
      return false;
    });
    if (data.readings.length !== prevLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  }

  public calculateMetrics(readings: Reading[]): ReportMetrics {
    if (readings.length === 0) {
      return {
        count: 0,
        highest: null,
        lowest: null,
        average: null,
      };
    }

    let highest = readings[0].value;
    let lowest = readings[0].value;
    let sum = 0;

    for (const r of readings) {
      if (r.value > highest) highest = r.value;
      if (r.value < lowest) lowest = r.value;
      sum += r.value;
    }

    const rawAvg = sum / readings.length;
    const average = Math.round(rawAvg * 10) / 10; // rounded to 1 decimal place

    return {
      count: readings.length,
      highest,
      lowest,
      average,
    };
  }
}

export const db = Database.getInstance();
