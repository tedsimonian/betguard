import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a ticker is a symbol or not. If the ticker length is greater than 6, it is not a symbol.
 *
 * @param ticker The ticker to check
 * @returns A boolean indicating if the ticker is a symbol or not. If the ticker length is greater than 6, it is not a symbol.
 */
export const isTickerSymbol = (ticker: string) => {
  return ticker.length < 6;
};

/**
 * Get the week number of a date
 *
 * @param date The date to get the week number of
 * @returns The week number of the date
 */
export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear: Date = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear: number = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};
