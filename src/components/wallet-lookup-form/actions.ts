"use server";

import type { GatewayBalancesRequest, GatewayBalancesResponse } from "xrpl";
import { ZodError } from "zod";
import { xrplRequest } from "@/lib/utils";
import type { Wallet } from "@/state/atoms/wallet-atom";
import { ServerActionState } from "@/types/common";
import { formSchema } from "./validation";

export const getWalletInfo = async (
  prevState: ServerActionState<Wallet>,
  data: FormData
): Promise<ServerActionState<Wallet>> => {
  try {
    const { walletAddress } = formSchema.parse(data);
    const response = await xrplRequest<GatewayBalancesRequest, GatewayBalancesResponse>({
      command: "gateway_balances",
      account: walletAddress,
    });

    console.log(JSON.stringify(response, null, 2));

    return {
      status: "success",
      message: `Welcome, ${response.result.account}!`,
      data: {
        address: response.result.account,
        assets: response.result.assets,
        transactions: [],
      },
    };
  } catch (e) {
    if (e instanceof ZodError) {
      return {
        status: "error",
        message: "Invalid form data.",
        data: null,
        errors: e.issues.map((issue) => ({
          path: issue.path.join("."),
          message: `Server validation: ${issue.message}`,
        })),
      };
    }
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
      data: null,
    };
  }
};
