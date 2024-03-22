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

export type Asset = {
  currency: string;
  value: number;
};

export type Address = {
  address: string;
  tag: string;
};

export type TransactionTransferType = "in" | "out";

export type Transaction = {
  transfer: TransactionTransferType;
  asset: Asset;
  source_address: Address;
  destination_address: Address;
  fee: Asset;
};
