export type Name = {
  name: string;
  desc: string;
  account: string;
  domain: string;
  twitter: string;
  verified: boolean;
};

export interface AccountRequest {
  account: string;
}

export interface AccountResponse {
  sequence: number;
  xrpBalance: string;
  ownerCount: number;
  previousAffectingTransactionID: string;
  previousAffectingTransactionLedgerVersion: number;
  Account: string;
  Balance: string;
  Flags: number;
  LedgerEntryType: string;
  OwnerCount: number;
  PreviousTxnID: string;
  PreviousTxnLgrSeq: number;
  Sequence: number;
  index: string;
  settings: Record<string, unknown>;
  ParsedFlags: Record<string, unknown>;
  account: string;
  parent: string;
  initial_balance: number;
  inception: string;
  ledger_index: number;
  tx_hash: string;
  accountName?: Name | null;
  parentName?: Name | null;
  advisory?: string | null;
}

export interface AccountAsset {
  counterparty: string;
  currency: string;
  value: string;
  counterpartyName: {
    username: string;
    account: string;
  };
}

export interface AccountAssetsRequest {
  account: string;
}

export type AccountAssetsResponse = AccountAsset[];

export interface WellKnownAccount {
  name: string;
  desc: string;
  account: string;
  domain?: string;
  twitter?: string;
  verified: boolean;
}

export type WellKnownAccountResponse = WellKnownAccount[];

export type AccountTransaction = {
  meta: {
    TransactionIndex: number;
    TransactionResult: string;
    delivered_amount: {
      value: number;
      currency: string;
    };
  };
  validated: boolean;
  Account: string;
  Amount: {
    value: number;
    currency: string;
  };
  Destination: string;
  DestinationTag: number;
  Fee: string;
  Flags: number;
  LastLedgerSequence: number;
  Sequence: number;
  SigningPubKey: string;
  TransactionType: string;
  TxnSignature: string;
  hash: string;
  ledger_index: number;
  date: string;
  AccountName: {
    name: string;
    desc: string;
    account: string;
    domain: string;
    twitter: string;
    verified: boolean;
  };
  DestinationName: {
    name: string;
    desc: string;
    account: string;
    domain: string;
    twitter: string;
    verified?: boolean;
  };
};

export interface AccountTransactionsRequest {
  account: string;
}

export type AccountTransactionsResponse = {
  account: string;
  ledger_index_min: number;
  ledger_index_max: number;
  transactions: AccountTransaction[];
  validated: boolean;
  marker: string;
  limit: number;
};

export type XummKYCStatusRequest = {
  account: string;
};

export type XummKYCStatusResponse = {
  account: string;
  kycApproved: boolean;
};
