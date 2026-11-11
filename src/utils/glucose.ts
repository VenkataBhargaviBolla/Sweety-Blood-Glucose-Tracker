import { TimeSlot } from '../types.ts';

export interface GlucoseCategory {
  label: 'Low' | 'In Target' | 'Elevated' | 'High';
  color: string;
  bgColor: string;
  textColor: string;
  badgeClass: string;
  description: string;
}

export function getGlucoseCategory(value: number, slot?: TimeSlot): GlucoseCategory {
  if (value < 70) {
    return {
      label: 'Low',
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-500',
      badgeClass: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
      description: 'Hypoglycemia warning (< 70 mg/dl)',
    };
  }

  // Fasting target is usually 70-100 or up to 130; post-meal target is < 140 or < 180
  const upperTarget = slot === 'Morning (fasting)' ? 130 : 140;

  if (value <= upperTarget) {
    return {
      label: 'In Target',
      color: '#10b981',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-500',
      badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
      description: 'Within clinical target range',
    };
  }

  if (value <= 200) {
    return {
      label: 'Elevated',
      color: '#f97316',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
      badgeClass: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300',
      description: 'Above target range (> 140 mg/dl)',
    };
  }

  return {
    label: 'High',
    color: '#ef4444',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500',
    badgeClass: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
    description: 'Significantly elevated (> 200 mg/dl)',
  };
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const mIdx = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${months[mIdx]} ${year}`;
}

export function formatDateRange(startDateStr: string, endDateStr: string): string {
  const [sY, sM, sD] = startDateStr.split('-');
  const [eY, eM, eD] = endDateStr.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const sMIdx = parseInt(sM, 10) - 1;
  const eMIdx = parseInt(eM, 10) - 1;

  if (sY === eY && sM === eM) {
    return `${parseInt(sD, 10)} ${months[sMIdx]} – ${parseInt(eD, 10)} ${months[eMIdx]} ${sY}`;
  }

  return `${parseInt(sD, 10)} ${months[sMIdx]} ${sY} – ${parseInt(eD, 10)} ${months[eMIdx]} ${eY}`;
}

export function getSlotIconName(slot: TimeSlot): string {
  switch (slot) {
    case 'Morning (fasting)':
      return 'Sun';
    case 'After breakfast':
      return 'Coffee';
    case 'After lunch':
      return 'Utensils';
    case 'After dinner':
      return 'Moon';
  }
}
