"use server";

import { ZodError } from "zod";
import { getAddressBalance } from "@/server/xrpl/xrpl";
import type { Wallet } from "@/state/atoms/wallet-atom";
import { ServerActionState } from "@/types/common";
import { formSchema } from "./validation";

export const getWalletInfo = async (
  prevState: ServerActionState<Wallet>,
  data: FormData
): Promise<ServerActionState<Wallet>> => {
  try {
    const { walletAddress } = formSchema.parse(data);
    const balance = await getAddressBalance(walletAddress);

    return {
      status: "success",
      message: `Welcome, ${walletAddress}!`,
      data: {
        address: walletAddress,
        balance,
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
