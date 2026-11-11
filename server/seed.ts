import { db } from './db.ts';

console.log('==============================================');
console.log('  SWEETY - KENPATH SEED SCRIPT INITIALIZING   ');
console.log('==============================================');

try {
  const result = db.seedDemoData();
  console.log('✅ Demo database seeded successfully!');
  console.log(`👤 Demo Patient Account:`);
  console.log(`   Email:    demo@kenpath.com`);
  console.log(`   Password: Password123!`);
  console.log(`   Name:     ${result.user.name}`);
  console.log(`\n👨‍⚕️ Demo Doctor Account:`);
  console.log(`   Email:    doctor@kenpath.com`);
  console.log(`   Password: Password123!`);
  console.log(`\n📈 Seeded Readings: ${result.readingsCount} records created across Sept, Oct (including Oct 15 reference), and Nov 2026.`);
  console.log('==============================================');
  process.exit(0);
} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
}
