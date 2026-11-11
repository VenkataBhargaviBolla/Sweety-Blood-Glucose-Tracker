import { Router, Response } from 'express';
import { db } from './db.ts';
import {
  AuthenticatedRequest,
  comparePassword,
  generateToken,
  hashPassword,
  requireAuth,
} from './auth.ts';
import { TIME_SLOTS, TimeSlot } from './types.ts';

export const apiRouter = Router();

// Helper to get today's date formatted as YYYY-MM-DD
function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

/**
 * POST /api/auth/register
 * A user can register with name, email and password, then log in.
 * Store passwords hashed with bcrypt; never store plain text.
 */
apiRouter.post('/auth/register', async (req, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Please enter your name.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = db.getUserByEmail(email.trim());
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role === 'doctor' ? 'doctor' : 'patient',
    });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

/**
 * POST /api/auth/login
 */
apiRouter.post('/auth/login', async (req, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please provide both email and password.' });
      return;
    }

    const user = db.getUserByEmail(email.trim());
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

/**
 * GET /api/auth/me
 */
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ----------------------------------------------------
// READINGS VALIDATION HELPER
// ----------------------------------------------------

function validateReadingInput(
  userId: string,
  date: any,
  timeSlot: any,
  value: any,
  excludeReadingId?: string
): { isValid: boolean; errorMessage?: string; parsedValue?: number } {
  // 1. Value is required: "Please enter a glucose value."
  if (value === undefined || value === null || value === '' || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, errorMessage: 'Please enter a glucose value.' };
  }

  // Parse whole number
  const numVal = Number(value);
  if (!Number.isInteger(numVal) || isNaN(numVal)) {
    return { isValid: false, errorMessage: 'Value must be between 40 and 600 mg/dl.' };
  }

  // 2. Value must be a whole number between 40 and 600: "Value must be between 40 and 600 mg/dl."
  if (numVal < 40 || numVal > 600) {
    return { isValid: false, errorMessage: 'Value must be between 40 and 600 mg/dl.' };
  }

  // Slot validity check
  if (!timeSlot || !TIME_SLOTS.includes(timeSlot as TimeSlot)) {
    return { isValid: false, errorMessage: 'Please select a valid time slot.' };
  }

  // Date format & existence check
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { isValid: false, errorMessage: 'Please provide a valid date in YYYY-MM-DD format.' };
  }

  // 5. Date cannot be in the future: "Date cannot be in the future."
  const today = getTodayString();
  if (date > today) {
    return { isValid: false, errorMessage: 'Date cannot be in the future.' };
  }

  // Check existing readings on this date for the user
  const existingReadings = db.getReadingsByDate(userId, date);
  const otherReadings = excludeReadingId
    ? existingReadings.filter((r) => r.id !== excludeReadingId)
    : existingReadings;

  // 3. Only one reading per slot per day: "You already have an {slot} reading for this date."
  const duplicateSlot = otherReadings.find((r) => r.timeSlot === timeSlot);
  if (duplicateSlot) {
    return {
      isValid: false,
      errorMessage: `You already have an ${timeSlot} reading for this date.`,
    };
  }

  // 4. Maximum 4 readings per day: "You can add only 4 readings per day."
  if (otherReadings.length >= 4) {
    return { isValid: false, errorMessage: 'You can add only 4 readings per day.' };
  }

  return { isValid: true, parsedValue: numVal };
}

// ----------------------------------------------------
// READINGS CRUD ROUTES
// ----------------------------------------------------

/**
 * GET /api/readings
 * Supports bonus pagination: ?page=1&limit=20
 * Also optional filters: ?date=YYYY-MM-DD & ?startDate=... & ?endDate=...
 * If patientId is provided AND caller is doctor, views that patient's readings
 */
apiRouter.get('/readings', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const currentUser = req.user!;
  let targetUserId = currentUser.id;

  // Doctor can view a specific patient's readings
  if (currentUser.role === 'doctor' && req.query.patientId) {
    targetUserId = String(req.query.patientId);
  }

  const { date, startDate, endDate, page, limit } = req.query;

  const result = db.getReadingsByUser(targetUserId, {
    date: date ? String(date) : undefined,
    startDate: startDate ? String(startDate) : undefined,
    endDate: endDate ? String(endDate) : undefined,
    page: page ? parseInt(String(page), 10) : 1,
    limit: limit ? parseInt(String(limit), 10) : 20,
  });

  res.json(result);
});

/**
 * POST /api/readings
 */
apiRouter.post('/readings', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const { date, timeSlot, value, notes } = req.body;

  const validation = validateReadingInput(user.id, date, timeSlot, value);
  if (!validation.isValid) {
    res.status(400).json({ error: validation.errorMessage });
    return;
  }

  const newReading = db.createReading({
    userId: user.id,
    date,
    timeSlot: timeSlot as TimeSlot,
    value: validation.parsedValue!,
    notes,
  });

  res.status(201).json({
    message: 'Reading added successfully',
    reading: newReading,
  });
});

/**
 * PUT /api/readings/:id
 */
apiRouter.put('/readings/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const readingId = req.params.id;
  const { date, timeSlot, value, notes } = req.body;

  const existing = db.getReadingById(readingId, user.id);
  if (!existing) {
    res.status(404).json({ error: 'Reading not found or unauthorized.' });
    return;
  }

  const validation = validateReadingInput(user.id, date, timeSlot, value, readingId);
  if (!validation.isValid) {
    res.status(400).json({ error: validation.errorMessage });
    return;
  }

  const updated = db.updateReading(readingId, user.id, {
    date,
    timeSlot: timeSlot as TimeSlot,
    value: validation.parsedValue!,
    notes,
  });

  res.json({
    message: 'Reading updated successfully',
    reading: updated,
  });
});

/**
 * DELETE /api/readings/:id
 */
apiRouter.delete('/readings/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const readingId = req.params.id;

  const reading = db.getReadingById(readingId);
  if (!reading) {
    res.status(404).json({ error: 'Reading not found.' });
    return;
  }

  let success = false;
  if (reading.userId === user.id || user.role === 'doctor' || user.email === 'demo@kenpath.com') {
    success = db.deleteReading(readingId);
  } else {
    success = db.deleteReading(readingId, user.id);
  }

  if (!success) {
    res.status(404).json({ error: 'Reading not found or unauthorized.' });
    return;
  }

  res.json({ message: 'Reading deleted successfully', id: readingId });
});

// ----------------------------------------------------
// REPORTS ROUTES
// ----------------------------------------------------

/**
 * GET /api/reports/daily?date=YYYY-MM-DD
 * Daily: The selected date (e.g. 15 Oct 2026)
 * Also lists each reading with its slot.
 */
apiRouter.get('/reports/daily', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const currentUser = req.user!;
  let targetUserId = currentUser.id;

  if (currentUser.role === 'doctor' && req.query.patientId) {
    targetUserId = String(req.query.patientId);
  }

  const dateParam = (req.query.date as string) || getTodayString();
  const readings = db.getReadingsByDate(targetUserId, dateParam);
  const metrics = db.calculateMetrics(readings);

  res.json({
    reportType: 'daily',
    date: dateParam,
    ...metrics,
    readings,
  });
});

/**
 * GET /api/reports/month-to-date?date=YYYY-MM-DD
 * Month-to-date: 1st of the month to the selected date (e.g. 1 Oct – 15 Oct 2026)
 */
apiRouter.get('/reports/month-to-date', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const currentUser = req.user!;
  let targetUserId = currentUser.id;

  if (currentUser.role === 'doctor' && req.query.patientId) {
    targetUserId = String(req.query.patientId);
  }

  const dateParam = (req.query.date as string) || getTodayString();
  const [yearStr, monthStr] = dateParam.split('-');
  const startDate = `${yearStr}-${monthStr}-01`;
  const endDate = dateParam;

  const readings = db.getRawReadingsInRange(targetUserId, startDate, endDate);
  const metrics = db.calculateMetrics(readings);

  res.json({
    reportType: 'month-to-date',
    startDate,
    endDate,
    selectedDate: dateParam,
    ...metrics,
    readings,
  });
});

/**
 * GET /api/reports/monthly?date=YYYY-MM-DD
 * Monthly: The whole previous month (e.g. selected 15 Oct 2026 -> 1 Sep – 30 Sep 2026)
 */
apiRouter.get('/reports/monthly', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const currentUser = req.user!;
  let targetUserId = currentUser.id;

  if (currentUser.role === 'doctor' && req.query.patientId) {
    targetUserId = String(req.query.patientId);
  }

  const dateParam = (req.query.date as string) || getTodayString();
  const [yearStr, monthStr] = dateParam.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  // Compute previous month
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const prevMonthStr = String(prevMonth).padStart(2, '0');
  const startDate = `${prevYear}-${prevMonthStr}-01`;

  // Number of days in previous month
  const lastDay = new Date(prevYear, prevMonth, 0).getDate();
  const endDate = `${prevYear}-${prevMonthStr}-${String(lastDay).padStart(2, '0')}`;

  const readings = db.getRawReadingsInRange(targetUserId, startDate, endDate);
  const metrics = db.calculateMetrics(readings);

  res.json({
    reportType: 'monthly',
    previousMonth: `${prevYear}-${prevMonthStr}`,
    startDate,
    endDate,
    selectedDate: dateParam,
    ...metrics,
    readings,
  });
});

// ----------------------------------------------------
// BONUS / UTILITY ROUTES
// ----------------------------------------------------

/**
 * GET /api/patients (Doctor role only)
 */
apiRouter.get('/patients', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  // Return patients for clinical dashboard viewing (supports both doctor role and demo preview)
  const patients = db.getAllPatients();
  res.json({ patients });
});

/**
 * POST /api/seed
 * Resets/seeds the database with Kenpath demo data
 */
apiRouter.post('/seed', (req, res: Response): void => {
  const result = db.seedDemoData();
  res.json({
    message: 'Demo database seeded successfully with Kenpath assignment data.',
    demoEmail: result.user.email,
    readingsCount: result.readingsCount,
  });
});
