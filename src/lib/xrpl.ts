import { JSON_RPC_URLS } from "@/constants";

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
export const request = async <TRequest extends IRequest, TResponse = any>(
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
