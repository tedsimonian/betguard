"use server";

import { ZodError } from "zod";

import {
  fetchAccountInfo,
  fetchXummKYCStatus,
  getAssets,
  getDepositingAccounts,
  isCustodialWallet,
} from "@/lib/xrp-scan";
import type { Wallet } from "@/state/atoms/wallet-atom";
import type { ServerActionState } from "@/types/common";
import { form_schema } from "./validation";

export const getWalletInfo = async (
  prevState: ServerActionState<Wallet>,
  data: FormData
): Promise<ServerActionState<Wallet>> => {
  try {
    console.debug("Parsing form data to extract wallet address.");
    const { wallet_address } = form_schema.parse(data);
    console.debug(`Wallet address extracted: ${wallet_address}`);

    console.debug(`Fetching account info for wallet address: ${wallet_address}`);
    const account_info = await fetchAccountInfo({
      account: wallet_address,
    });
    console.debug(`Account info retrieved for ${wallet_address}:`, account_info);

    console.debug(`Fetching assets for wallet address: ${wallet_address}`);
    const assets = await getAssets(wallet_address);
    console.debug(`Assets retrieved for ${wallet_address}:`, assets);

    console.debug(`Fetching Xumm KYC status for wallet address: ${wallet_address}`);
    const xumm_kyc_status = await fetchXummKYCStatus({
      account: wallet_address,
    });
    console.debug(`Xumm KYC status for ${wallet_address}:`, xumm_kyc_status);

    console.debug(`Fetching custodial status for wallet address: ${wallet_address}`);
    const is_custodial = await isCustodialWallet(wallet_address);
    console.debug(`Custodial status for ${wallet_address}:`, is_custodial);

    const depositing_accounts = await getDepositingAccounts(wallet_address);

    console.debug(`Returning data for ${wallet_address}.`);
    return {
      status: "success",
      message: `Successfully retrieved account info for ${wallet_address}.`,
      data: {
        balance: {
          currency: "XRP",
          value: parseFloat(account_info.xrpBalance),
          issuer: "",
        },
        account: account_info.account,
        account_name: account_info.accountName?.name,
        parent: account_info.parent,
        parent_name: account_info.parentName?.name,
        is_custodial,
        is_xumm_kyc_approved: xumm_kyc_status.kycApproved,
        assets,
        transactions: [],
        depositing_accounts: depositing_accounts,
      },
    };
  } catch (e) {
    console.error("Error:", e);
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
