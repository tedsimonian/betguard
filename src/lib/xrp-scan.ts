import { dropsToXrp } from "xrpl";
import { XRP_SCAN_API_URL } from "@/constants";
import type { Asset } from "@/types/common";
import { isXRP, normalizeCurrencyCode } from "./utils";
import type {
  AccountAssetsRequest,
  AccountAssetsResponse,
  AccountRequest,
  AccountResponse,
  AccountTransactionsRequest,
  AccountTransactionsResponse,
  WellKnownAccountResponse,
  XummKYCStatusRequest,
  XummKYCStatusResponse,
} from "../types/xrp-scan";

const fetchApi = async <TResponse = any>(url: string): Promise<TResponse> => {
  console.debug(`Fetching data from URL: ${url}`);
  const response = await fetch(url);
  console.debug(`Response status: ${response.status}`);
  if (!response.ok) {
    console.error("Network response was not ok");
    throw new Error("Network response was not ok");
  }
  const json_response = (await response.json()) as TResponse;
  return json_response;
};

export const fetchAccountInfo = async (request: AccountRequest): Promise<AccountResponse> => {
  return await fetchApi<AccountResponse>(`${XRP_SCAN_API_URL}/account/${request.account}`);
};

export const fetchAccountAssets = async (request: AccountAssetsRequest): Promise<AccountAssetsResponse> => {
  return await fetchApi<AccountAssetsResponse>(`${XRP_SCAN_API_URL}/account/${request.account}/assets`);
};

export const fetchAccountTransactions = async (
  request: AccountTransactionsRequest
): Promise<AccountTransactionsResponse> => {
  return await fetchApi<AccountTransactionsResponse>(`${XRP_SCAN_API_URL}/account/${request.account}/transactions`);
};

export const fetchWellKnownAccounts = async (): Promise<WellKnownAccountResponse> => {
  return await fetchApi<WellKnownAccountResponse>(`${XRP_SCAN_API_URL}/names/well-known`);
};

export const fetchXummKYCStatus = async (request: XummKYCStatusRequest): Promise<XummKYCStatusResponse> => {
  return await fetchApi<XummKYCStatusResponse>(`${XRP_SCAN_API_URL}/account/${request.account}/xummkyc`);
};

export const getAssets = async (account: string): Promise<Asset[]> => {
  const account_assets = await fetchAccountAssets({
    account,
  });

  const assets: Asset[] = account_assets.map((asset) => ({
    currency: normalizeCurrencyCode(asset.currency),
    value: parseFloat(asset.value),
    issuer: asset.counterparty || null,
  }));

  return assets;
};

export enum IsCustodialAccountEnum {
  LIKELY_CUSTODIAL = "likely custodial",
  UNLIKELY_CUSTODIAL = "unlikely custodial",
  NOT_CUSTODIAL = "not custodial",
  CUSTODIAL = "custodial",
  UNKNOWN = "unknown",
}

export const isCustodialWallet = async (wallet_address: string): Promise<IsCustodialAccountEnum> => {
  try {
    const well_known_accounts = await fetchWellKnownAccounts();
    const xumm_kyc_status = await fetchXummKYCStatus({
      account: wallet_address,
    });

    const found_account = well_known_accounts.find((account) => account.account === wallet_address);

    if (found_account) {
      // If the account is found in the well-known list, it's likely custodial.
      return IsCustodialAccountEnum.LIKELY_CUSTODIAL;
    }

    if (xumm_kyc_status.kycApproved) {
      return IsCustodialAccountEnum.LIKELY_CUSTODIAL;
    }

    return IsCustodialAccountEnum.NOT_CUSTODIAL; // If no indicators of being custodial are found, return NOT_CUSTODIAL.
  } catch (error) {
    console.error("Error checking custodial status:", error);
    return IsCustodialAccountEnum.UNKNOWN; // Return UNKNOWN in case of an error.
  }
};

export type DepositingAccount = {
  account: string;
  account_name?: string | null;
  destination_tag?: number | null;
  currency: string;
  value: number;
  frequency: number;
};

type DepositingAccountResponse = DepositingAccount[];

export const getDepositingAccounts = async (wallet_address: string): Promise<DepositingAccountResponse> => {
  const account_tx = await fetchAccountTransactions({
    account: wallet_address,
  });

  const depositing_accounts_map: { [key: string]: DepositingAccount } = {};

  account_tx.transactions.forEach((transaction) => {
    const { Destination, DestinationTag, DestinationName, Amount } = transaction;

    // Check if Amount is defined and has a currency property
    if (Amount && Amount.currency) {
      const key = Destination;

      let amount = Amount.value;
      // check if currency is xrp, if it is, convert drops to xrp
      if (isXRP(Amount.currency)) {
        amount = dropsToXrp(Amount.value);
      }

      if (!depositing_accounts_map[key]) {
        depositing_accounts_map[key] = {
          account: Destination,
          account_name: DestinationName?.name,
          destination_tag: DestinationTag,
          currency: normalizeCurrencyCode(Amount.currency),
          value: amount,
          frequency: 1,
        };
      } else {
        depositing_accounts_map[key]!.value += amount;
        depositing_accounts_map[key]!.frequency += 1;
      }
    }
  });

  return Object.values(depositing_accounts_map);
};
