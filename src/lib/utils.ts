import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { JSON_RPC_URLS } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IRequest {
  command: string;
}

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
