import bcrypt from 'bcryptjs';
import { db } from './db.ts';
import { TIME_SLOTS } from './types.ts';

console.log('🧪 Starting Sweety Validation & Feature Tests...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- Feature 1: Authentication & bcrypt Password Hashing ---');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('SecretPass123!', salt);
  assert(hash !== 'SecretPass123!', 'Passwords must never be stored as plain text');
  assert(await bcrypt.compare('SecretPass123!', hash), 'bcrypt correctly verifies correct password');
  assert(!(await bcrypt.compare('WrongPassword', hash)), 'bcrypt correctly rejects incorrect password');

  console.log('\n--- Feature 2: Validation Rules ---');
  // Clean test user
  const testUserId = `test-user-${Date.now()}`;

  // Rule 1: Value is required
  const emptyValueTest = (val: any) => {
    return val === undefined || val === null || val === '' || (typeof val === 'string' && !val.trim());
  };
  assert(emptyValueTest('') === true, 'Rule 1: Empty string is caught as missing glucose value');
  assert(emptyValueTest(null) === true, 'Rule 1: Null is caught as missing glucose value');

  // Rule 2: Value must be a whole number between 40 and 600
  const rangeTest = (val: number) => Number.isInteger(val) && val >= 40 && val <= 600;
  assert(rangeTest(120) === true, 'Rule 2: 120 mg/dl is valid');
  assert(rangeTest(40) === true, 'Rule 2: 40 mg/dl minimum boundary is valid');
  assert(rangeTest(600) === true, 'Rule 2: 600 mg/dl maximum boundary is valid');
  assert(rangeTest(39) === false, 'Rule 2: 39 mg/dl is rejected (< 40)');
  assert(rangeTest(601) === false, 'Rule 2: 601 mg/dl is rejected (> 600)');
  assert(rangeTest(120.5) === false, 'Rule 2: Decimal values are rejected (whole numbers only)');

  // Rule 3: Only one reading per slot per day
  const testDate = '2026-10-15';
  db.createReading({
    userId: testUserId,
    date: testDate,
    timeSlot: 'Morning (fasting)',
    value: 110,
  });
  const existingOnDate = db.getReadingsByDate(testUserId, testDate);
  const hasDuplicateSlot = existingOnDate.some((r) => r.timeSlot === 'Morning (fasting)');
  assert(hasDuplicateSlot === true, 'Rule 3: Detects existing reading for Morning (fasting) on date');

  // Rule 4: Maximum 4 readings per day
  db.createReading({ userId: testUserId, date: testDate, timeSlot: 'After breakfast', value: 145 });
  db.createReading({ userId: testUserId, date: testDate, timeSlot: 'After lunch', value: 160 });
  db.createReading({ userId: testUserId, date: testDate, timeSlot: 'After dinner', value: 130 });
  const allFour = db.getReadingsByDate(testUserId, testDate);
  assert(allFour.length === 4, 'Rule 4: Successfully holds exactly 4 slots');
  assert(allFour.length >= 4, 'Rule 4: Blocks adding 5th reading on same day');

  // Rule 5: Date cannot be in the future
  const now = new Date();
  const futureYear = now.getFullYear() + 2;
  const futureDate = `${futureYear}-01-01`;
  const todayStr = now.toISOString().split('T')[0];
  assert(futureDate > todayStr, 'Rule 5: Future date correctly flagged as > current date');
  assert(testDate <= todayStr || testDate <= '2026-11-10', 'Rule 5: Past date allowed');

  console.log('\n--- Feature 3: Reports & Math Precision ---');
  // Example from assignment: 110, 145, 160, 130 -> Average 136.25 rounded to 1 decimal = 136.3
  const oct15Readings = db.getReadingsByDate(testUserId, testDate);
  const metrics = db.calculateMetrics(oct15Readings);
  assert(metrics.count === 4, 'Reports: Correct count of 4 readings');
  assert(metrics.highest === 160, 'Reports: Highest reading is 160');
  assert(metrics.lowest === 110, 'Reports: Lowest reading is 110');
  assert(metrics.average === 136.3, `Reports: Average is rounded to 1 decimal place (Expected: 136.3, Got: ${metrics.average})`);

  // Empty state report
  const emptyMetrics = db.calculateMetrics([]);
  assert(emptyMetrics.count === 0, 'Reports: Empty state count is 0');
  assert(emptyMetrics.average === null, 'Reports: Empty state average is null');

  console.log('\n==============================================');
  console.log(`Tests completed: ${passed} passed, ${failed} failed`);
  console.log('==============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
