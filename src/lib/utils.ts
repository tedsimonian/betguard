import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { JSON_RPC_URLS } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IRequest {
  command: string;
}

/**
 * A convenience method to call XRP Ledger JSON-RPC endpoints using xrpl.js types
 *
 * @param request The type of JSON-RPC request being made including all it's params
 * @param server The server endpoint to call. Defaults to Mainnet endpoint
 * @returns A data object that follows the TResponse Type otherwise throw an error.
 */
export const xrplRequest = async <TRequest extends IRequest, TResponse = any>(
  request: TRequest,
  server?: keyof typeof JSON_RPC_URLS
): Promise<TResponse> => {
  const url = server ? JSON_RPC_URLS[server] : JSON_RPC_URLS.Mainnet_1;
  const { command, ...params } = request;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: command,
        params: [params],
      }),
    });

    if (!response.ok) {
      throw new Error(`JSON-RPC request failed: ${command}`);
    }

    const data = (await response.json()) as TResponse;
    return data;
  } catch (error) {
    console.error(`Error in JSON-RPC request: ${command}`, error);
    throw error;
  }
};

type OnTheDexTokenMeta = {
  currency: string;
  issuer: string;
  token_name: string;
  logo_file: string;
};

type OnTheDexResponse = {
  meta: OnTheDexTokenMeta[];
};

/**
 * Get a currency's ticker by a provider token address.
 *
 * @param address The issuer's address to get the ticker for.
 * @returns The ticker for the token address or null if not found
 */
export const getCurrencyTickerByAddress = async (address: string) => {
  if (!address || address.length === 0) return null;

  try {
    const response = await fetch(`https://api.onthedex.live/public/v1/token/meta/${address}`);
    console.log(response);
    const data = (await response.json()) as OnTheDexResponse;
    console.log(data);
    return data.meta[0]?.token_name ?? null;
  } catch (error) {
    console.error(`Error in getCurrencyTickerByAddress: ${address}`, error);
    return null;
  }
};

/**
 * Get multiple currency's tickers by a multiple token addresses.
 *
 * @param addresses The issuer's addresses to get the tickers for.
 * @returns The tickers for the token addresses or an empty array if not found
 */
export const getCurrencyTickersByAddresses = async (addresses: string[]) => {
  if (addresses.length === 0) return [];

  try {
    const response = await fetch(`https://api.onthedex.live/public/v1/token/meta`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tokens: [...addresses] }),
    });

    const data = (await response.json()) as OnTheDexResponse;
    return data.meta.map((meta) => meta.token_name);
  } catch (error) {
    console.error(`Error in getCurrencyTickersByAddresses: ${addresses}`, error);
    return [];
  }
};

/**
 * Check if a ticker is a symbol or not. If the ticker length is greater than 6, it is not a symbol.
 *
 * @param ticker The ticker to check
 * @returns A boolean indicating if the ticker is a symbol or not. If the ticker length is greater than 6, it is not a symbol.
 */
export const isTickerSymbol = (ticker: string) => {
  return ticker.length < 6;
};
