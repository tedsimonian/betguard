import { atom } from "jotai";
import { IsCustodialAccountEnum } from "@/lib/xrp-scan";
import { Asset, Transaction } from "@/types/common";

export type Wallet = {
  account: string;
  balance: Asset;
  account_name?: string | null;
  parent: string;
  parent_name?: string | null;
  is_custodial: IsCustodialAccountEnum;
  is_xumm_kyc_approved: boolean;
  assets: Asset[];
  transactions: Transaction[];
  depositing_accounts: any;
};

export const default_wallet: Wallet = {
  account: "XXXXXXXXXXXXXXXXXXXXXXXX",
  balance: {
    currency: "XRP",
    value: 0,
    issuer: "",
  },
  account_name: null,
  parent: "XXXXXXXXXXXXXXXXXXXXXXXX",
  parent_name: null,
  is_custodial: IsCustodialAccountEnum.UNKNOWN,
  is_xumm_kyc_approved: false,
  assets: [],
  transactions: [],
  depositing_accounts: null,
};

export const wallet_atom = atom<Wallet>(default_wallet);
