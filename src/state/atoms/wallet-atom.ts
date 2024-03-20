import { atom } from "jotai";

export type Transaction = {
  hash: string;
  from: string;
  to: string;
  value: number;
};

export type Wallet = {
  address: string;
  assets: any;
  transactions: any;
};

export const defaultWallet: Wallet = {
  address: "XXXXXXXXXXXXXXXXXXXXXXXX",
  assets: [],
  transactions: [],
};

export const walletAtom = atom<Wallet>(defaultWallet);
