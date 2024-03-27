import { atom } from "jotai";
import { type Amount } from "xrpl";
import { Transaction } from "@/types/common";

export type Wallet = {
  address: string;
  balance: Amount;
  total_balance: Amount;
  assets: Amount[];
  transactions: Transaction[];
  other: any;
};

export const defaultWallet: Wallet = {
  address: "XXXXXXXXXXXXXXXXXXXXXXXX",
  balance: {
    currency: "XRP",
    value: "0",
    issuer: "",
  },
  total_balance: {
    currency: "USD",
    value: "0",
    issuer: "",
  },
  assets: [],
  transactions: [],
  other: null,
};

export const walletAtom = atom<Wallet>(defaultWallet);
