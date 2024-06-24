import type { Memo } from "xrpl";

export type ServerActionState<TData> =
  | {
      status: "success";
      message: string;
      data?: TData | null;
    }
  | {
      status: "error";
      message: string;
      data?: TData | null;
      errors?: Array<{
        path: string;
        message: string;
      }>;
    }
  | null;

export type Address = {
  address: string;
  tag?: number | null;
  domain?: string | null;
};

export type Asset = {
  currency: string;
  value: number;
  issuer: string | null;
};

export type TransactionTransferType = "deposit" | "withdrawal";

export type Transaction = {
  transfer: TransactionTransferType;
  asset: Asset;
  memos?: Memo[];
  source: Address;
  destination: Address;
  fee?: string;
  date?: Date | null;
};
