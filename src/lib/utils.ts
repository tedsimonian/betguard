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

  console.debug(`Normalizing currency code: ${currencyCode}`);

  if (currencyCode.length === 3) {
    console.debug(`Currency code is a standard currency code: ${currencyCode}`);
    // "Standard" currency code
    return currencyCode.trim();
  }

  if (currencyCode.match(/^[a-fA-F0-9]{40}$/) && !isNaN(parseInt(currencyCode, 16))) {
    console.debug(`Currency code is a non-standard currency code: ${currencyCode}`);
    // Hexadecimal currency code
    const hex = currencyCode.toString().replace(/(00)+$/g, "");
    if (hex.startsWith("01")) {
      console.debug(`Currency code is an old demurrage code: ${currencyCode}`);
      // Old demurrage code. https://xrpl.org/demurrage.html
      return convertDemurrageToUTF8(currencyCode);
    }
    if (hex.startsWith("02")) {
      console.debug(
        `Currency code is an XLS-16d NFT Metadata using XLS-15d Concise Transaction Identifier: ${currencyCode}`
      );
      // XLS-16d NFT Metadata using XLS-15d Concise Transaction Identifier
      // https://github.com/XRPLF/XRPL-Standards/discussions/37
      const xlf15d = Buffer.from(hex, "hex").subarray(8).toString("utf-8").slice(0, maxLength).trim();
      if (xlf15d.match(/[a-zA-Z0-9]{3,}/) && xlf15d.toLowerCase() !== "xrp") {
        console.debug(
          `Currency code is an XLS-16d NFT Metadata using XLS-15d Concise Transaction Identifier: ${currencyCode}`
        );
        return xlf15d;
      }
    }
    const decodedHex = Buffer.from(hex, "hex").toString("utf-8").slice(0, maxLength).trim();
    if (decodedHex.match(/[a-zA-Z0-9]{3,}/) && decodedHex.toLowerCase() !== "xrp") {
      console.debug(`Currency code is an ASCII or UTF-8 encoded alphanumeric code: ${currencyCode}`);
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

type CurrencyFormatOptions = {
  symbolReplacement: string | null;
  currencyCode: string;
  locale: string;
};

/**
 * Formats a number or string into a currency string for display.
 *
 * @param value The value to format
 * @param options The options to use for formatting
 * @returns A formatted currency string
 */
export const formatCurrency = (value: number | string, options?: CurrencyFormatOptions): string => {
  const { symbolReplacement, currencyCode, locale } = options ?? {
    symbolReplacement: null,
    currencyCode: "USD",
    locale: "en-US",
  };

  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  let formattedCurrency = new Intl.NumberFormat(locale ?? "en-US", {
    style: "currency",
    currency: currencyCode ?? "USD",
  }).format(numberValue);

  if (symbolReplacement !== null) {
    formattedCurrency = formattedCurrency.replace(/[\u00A4$]/, symbolReplacement);
  }

  return formattedCurrency;
};

/**
 * Formats a number string to add decimals and commas for readability.
 *
 * @param numberString The number string to format
 * @returns A string with the formatted number
 */
export const formatNumber = (value: number | string): string => {
  const number = typeof value === "string" ? parseFloat(value) : value;
  return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Capitalizes the first letter of a string.
 *
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export const capitalizeString = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Checks if a currency code is XRP.
 *
 * @param currencyCode The currency code to check
 * @returns A boolean indicating if the currency code is XRP
 */
export const isXRP = (currencyCode: string): boolean => {
  return currencyCode.trim().toLowerCase() === "xrp";
};
