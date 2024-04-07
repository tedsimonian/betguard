"use server";

import {
  type AccountInfoRequest,
  type AccountInfoResponse,
  type AccountLinesRequest,
  type AccountLinesResponse,
  dropsToXrp,
} from "xrpl";
import { ZodError } from "zod";
import { analyzeTransactions, fetchLastSevenDayTransactionHistory, request, summarizeTransactions } from "@/lib/xrpl";
import type { Wallet } from "@/state/atoms/wallet-atom";
import { ServerActionState } from "@/types/common";
import { formSchema } from "./validation";

export const getWalletInfo = async (
  prevState: ServerActionState<Wallet>,
  data: FormData
): Promise<ServerActionState<Wallet>> => {
  try {
    const { walletAddress } = formSchema.parse(data);

    const ai_response = await request<AccountInfoRequest, AccountInfoResponse>({
      command: "account_info",
      account: walletAddress,
      ledger_index: "validated",
    });

    const al_response = await request<AccountLinesRequest, AccountLinesResponse>({
      command: "account_lines",
      account: walletAddress,
      ledger_index: "validated",
    });

    const account_address = ai_response.result.account_data.Account;
    const xrp_balance = dropsToXrp(Number(ai_response.result.account_data.Balance));

    const last_seven_days_transactions = await fetchLastSevenDayTransactionHistory(walletAddress);
    const analyzed_transactions = analyzeTransactions(last_seven_days_transactions, walletAddress);
    const summary = summarizeTransactions(analyzed_transactions);

    const transformed_lines = al_response.result.lines.map((line) => ({
      currency: line.currency,
      value: line.balance,
      issuer: line.account,
    }));

    return {
      status: "success",
      message: `Successfully retrieved account info for ${walletAddress}.`,
      data: {
        address: account_address,
        balance: {
          currency: "XRP",
          value: String(xrp_balance),
          issuer: "",
        },
        total_balance: {
          currency: "USD",
          value: String(0),
          issuer: "",
        },
        assets: transformed_lines,
        transactions: [],
        other: summary,
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
