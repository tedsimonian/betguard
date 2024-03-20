import { atom } from "jotai";

export type Transaction = {
  hash: string;
  from: string;
  to: string;
  value: number;
};

export type Wallet = {
  address: string;
  balance: number;
  transactions: Array<any>;
};

export const defaultWallet: Wallet = {
  address: "XXXXXXXXXXXXXXXXXXXXXXXX",
  balance: 0,
  transactions: [],
};

export const walletAtom = atom<Wallet>(defaultWallet);
