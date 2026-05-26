import { differenceInDays, addDays } from "date-fns";

export function calculateWeek(
  lmp: Date,
  today: Date = new Date()
): { week: number; day: number } {
  const daysElapsed = differenceInDays(today, lmp);
  const week = Math.floor(daysElapsed / 7) + 1;
  const day = (daysElapsed % 7) + 1;
  return { week: Math.max(1, week), day: Math.max(1, day) };
}

export function getDueDate(lmp: Date): Date {
  return addDays(lmp, 280);
}

export function getDaysUntilDue(dueDate: Date, today: Date = new Date()): number {
  return Math.max(0, differenceInDays(dueDate, today));
}

export function getWeeksUntilDue(dueDate: Date, today: Date = new Date()): number {
  return Math.ceil(getDaysUntilDue(dueDate, today) / 7);
}

export function lmpFromDueDate(dueDate: Date): Date {
  return addDays(dueDate, -280);
}

export function formatPregnancyProgress(week: number): string {
  if (week <= 13) return `임신 ${Math.ceil(week / 4)}개월 (초기)`;
  if (week <= 27) return `임신 ${Math.ceil(week / 4)}개월 (중기)`;
  return `임신 ${Math.ceil(week / 4)}개월 (후기)`;
}
