import { Client } from "xrpl";
import { Networks } from "@/constants";
import { env } from "env.mjs";

const createXRPLClient = () => new Client(Networks.Devnet);

const globalForXRPL = globalThis as unknown as {
  client: ReturnType<typeof createXRPLClient> | undefined;
};

export const xrplClient = globalForXRPL.client ?? createXRPLClient();

if (env.NODE_ENV !== "production") globalForXRPL.client = xrplClient;
