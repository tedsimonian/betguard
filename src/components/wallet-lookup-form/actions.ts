"use server";

import {
  type AccountInfoRequest,
  type AccountInfoResponse,
  type AccountLinesRequest,
  type AccountLinesResponse,
  dropsToXrp,
} from "xrpl";
import { ZodError } from "zod";
import { getCurrencyTickerByAddress, isTickerSymbol, xrplRequest } from "@/lib/utils";
import type { Wallet } from "@/state/atoms/wallet-atom";
import { Asset, ServerActionState } from "@/types/common";
import { formSchema } from "./validation";

export const getWalletInfo = async (
  prevState: ServerActionState<Wallet>,
  data: FormData
): Promise<ServerActionState<Wallet>> => {
  try {
    const { walletAddress } = formSchema.parse(data);

    const ai_response = await xrplRequest<AccountInfoRequest, AccountInfoResponse>({
      command: "account_info",
      account: walletAddress,
      ledger_index: "validated",
    });

    const al_response = await xrplRequest<AccountLinesRequest, AccountLinesResponse>({
      command: "account_lines",
      account: walletAddress,
      ledger_index: "validated",
    });

    const account_address = ai_response.result.account_data.Account;
    const xrp_balance = dropsToXrp(Number(ai_response.result.account_data.Balance));
    const assets: Asset[] = [];

    const transformed_lines = al_response.result.lines.map((line) => ({
      currency: line.currency,
      value: line.balance,
      issuer: line.account,
    }));

    for (const line of transformed_lines) {
      if (isTickerSymbol(line.currency)) {
        assets.push({
          currency: line.currency,
          value: Number(line.value),
        });

        continue;
      } else {
        const ticker = await getCurrencyTickerByAddress(line.issuer);

        if (!ticker) {
          continue;
        }

        assets.push({
          currency: ticker,
          value: Number(line.value),
        });
      }
    }

    return {
      status: "success",
      message: `Successfully retrieved account info for ${walletAddress}.`,
      data: {
        address: account_address,
        balance: {
          currency: "XRP",
          value: xrp_balance,
        },
        total_balance: {
          currency: "USD",
          value: 0,
        },
        assets,
        transactions: [],
        other: ai_response,
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
