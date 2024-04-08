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

export const normalizeCurrencyCode = (currencyCode: string, maxLength = 20) => {
  if (!currencyCode) return "";

  if (currencyCode.length === 3 && currencyCode.trim().toLowerCase() !== "xrp") {
    // "Standard" currency code
    return currencyCode.trim();
  }

  if (currencyCode.match(/^[a-fA-F0-9]{40}$/) && !isNaN(parseInt(currencyCode, 16))) {
    // Hexadecimal currency code
    const hex = currencyCode.toString().replace(/(00)+$/g, "");
    if (hex.startsWith("01")) {
      // Old demurrage code. https://xrpl.org/demurrage.html
      return convertDemurrageToUTF8(currencyCode);
    }
    if (hex.startsWith("02")) {
      // XLS-16d NFT Metadata using XLS-15d Concise Transaction Identifier
      // https://github.com/XRPLF/XRPL-Standards/discussions/37
      const xlf15d = Buffer.from(hex, "hex").slice(8).toString("utf-8").slice(0, maxLength).trim();
      if (xlf15d.match(/[a-zA-Z0-9]{3,}/) && xlf15d.toLowerCase() !== "xrp") {
        return xlf15d;
      }
    }
    const decodedHex = Buffer.from(hex, "hex").toString("utf-8").slice(0, maxLength).trim();
    if (decodedHex.match(/[a-zA-Z0-9]{3,}/) && decodedHex.toLowerCase() !== "xrp") {
      // ASCII or UTF-8 encoded alphanumeric code, 3+ characters long
      return decodedHex;
    }
  }
  return "";
};

export const convertDemurrageToUTF8 = (demurrageCode: string) => {
  let bytes = Buffer.from(demurrageCode, "hex");
  let code =
    String.fromCharCode(bytes[1] ?? 0) + String.fromCharCode(bytes[2] ?? 0) + String.fromCharCode(bytes[3] ?? 0);
  let interest_start = ((bytes[4] ?? 0) << 24) + ((bytes[5] ?? 0) << 16) + ((bytes[6] ?? 0) << 8) + (bytes[7] ?? 0);
  let interest_period = bytes.readDoubleBE(8);
  const year_seconds = 31536000; // By convention, the XRP Ledger's interest/demurrage rules use a fixed number of seconds per year (31536000), which is not adjusted for leap days or leap seconds
  let interest_after_year = Math.pow(Math.E, (interest_start + year_seconds - interest_start) / interest_period);
  let interest = interest_after_year * 100 - 100;

  return `${code} (${interest}% pa)`;
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

/**
 * Check if two dates are the same day
 *
 * @param date1 The first date
 * @param date2 The second date
 * @returns A boolean indicating if the two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
