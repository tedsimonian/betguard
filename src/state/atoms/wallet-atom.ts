import { atom } from "jotai";
import { Asset, Transaction } from "@/types/common";

export type Wallet = {
  address: string;
  balance: Asset;
  total_balance: Asset;
  assets: Asset[];
  transactions: Transaction[];
  other: any;
};

export const defaultWallet: Wallet = {
  address: "XXXXXXXXXXXXXXXXXXXXXXXX",
  balance: {
    currency: "XRP",
    value: 0,
  },
  total_balance: {
    currency: "USD",
    value: 0,
  },
  assets: [],
  transactions: [],
  other: null,
};

export const walletAtom = atom<Wallet>(defaultWallet);
