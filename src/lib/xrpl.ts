import {
  type AccountTxRequest,
  type AccountTxResponse,
  type AccountTxTransaction,
  type Amount,
  dropsToXrp,
  type Payment,
  type ResponseOnlyTxInfo,
  rippleTimeToISOTime,
  type Transaction as RippleTransaction,
} from "xrpl";

import { JSON_RPC_URLS } from "@/constants";
import type { Asset, Transaction } from "@/types/common";
import { getWeekNumber } from "./utils";

interface IRequest {
  command: string;
}

/**
 * A convenience method to call XRP Ledger JSON-RPC endpoints using xrpl.js types
 *
 * @param request The type of JSON-RPC request being made including all it's params
 * @param server The server endpoint to call. Defaults to Mainnet endpoint
 * @returns A data object that follows the TResponse Type otherwise throw an error.
 */
export const request = async <TRequest extends IRequest, TResponse = any>(
  request: TRequest,
  server?: keyof typeof JSON_RPC_URLS
): Promise<TResponse> => {
  const url = server ? JSON_RPC_URLS[server] : JSON_RPC_URLS.Mainnet_1;
  const { command, ...params } = request;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: command,
        params: [params],
      }),
    });

    if (!response.ok) {
      throw new Error(`JSON-RPC request failed: ${command}`);
    }

    const data = (await response.json()) as TResponse;
    return data;
  } catch (error) {
    console.error(`Error in JSON-RPC request: ${command}`, error);
    throw error;
  }
};

export const fetchTransactionHistory = async (
  walletAddress: string,
  type: RippleTransaction["TransactionType"] = "Payment",
  limit: number = 200
) => {
  try {
    const tx_response = await request<AccountTxRequest, AccountTxResponse>({
      command: "account_tx",
      account: walletAddress,
      ledger_index: "validated",
      ledger_index_max: -1,
      ledger_index_min: -1,
      limit,
    });

    const filtered_tx_history = tx_response.result.transactions.filter(
      (transaction) => transaction.tx?.TransactionType === type
    );

    return filtered_tx_history;
  } catch (error) {
    console.error("Error fetching transaction history", error);
    throw error;
  }
};

export const analyzeTransactionAmount = (amount: Amount): Asset => {
  if (typeof amount === "string") {
    // XRP Amount
    return { currency: "XRP", value: dropsToXrp(parseFloat(amount)), issuer: null };
  } else {
    // Issued Currency
    return { currency: amount.currency, value: parseFloat(amount.value), issuer: amount.issuer };
  }
};

/**
 * Analyze transactions to determine if they are deposits or withdrawals
 *
 * @param transactions The transactions to analyze
 * @param walletAddress The wallet address to analyze transactions for
 * @returns Returns an array of transactions that are either deposits or withdrawals (in or out)
 */
export const analyzeTransactions = (transactions: AccountTxTransaction[], walletAddress: string) => {
  const analyzed_transactions = [] as Transaction[];

  transactions.forEach((transaction) => {
    if (!transaction.tx) return;

    const { tx } = transaction;
    const { Destination, DestinationTag, Account, Amount, Memos, Fee, SourceTag } = tx as Payment & ResponseOnlyTxInfo;

    const amount_info = analyzeTransactionAmount(Amount);
    // Convert Ripple Epoch to JavaScript Date
    const converted_ripple_date = tx.date ? rippleTimeToISOTime(tx.date) : null;
    const date = converted_ripple_date ? new Date(converted_ripple_date) : null;

    // If the destination address is the same as the wallet address then it is a deposit
    if (Destination === walletAddress) {
      analyzed_transactions.push({
        transfer: "in",
        asset: amount_info,
        memos: Memos,
        destination: {
          address: Destination,
          tag: DestinationTag,
        },
        source: {
          address: Account,
          tag: SourceTag,
        },
        fee: Fee,
        date,
      });
      // If the Account address is the same as the wallet address then it is a withdrawal
    } else if (Account === walletAddress) {
      analyzed_transactions.push({
        transfer: "out",
        asset: amount_info,
        memos: Memos,
        destination: {
          address: Destination,
          tag: DestinationTag,
        },
        source: {
          address: Account,
          tag: SourceTag,
        },
        fee: Fee,
        date,
      });
    }
  });

  return analyzed_transactions;
};

interface Accumulator {
  [key: string]: {
    currency: string;
    total: number;
    issuer?: string | null;
  };
}

/**
 *  Summarize transactions by currency
 *
 * @param transactions The transactions to summarize
 * @returns An object with the currency as the key and the total value as the value
 */
export const summarizeByCurrency = (transactions: Transaction[]) => {
  return transactions.reduce((acc: Accumulator, tx: Transaction) => {
    const { asset } = tx;
    const { currency, issuer, value } = asset;

    const currencyKey = currency + (issuer ? `:${issuer}` : "");
    if (!acc[currencyKey]) {
      acc[currencyKey] = { currency, total: 0, issuer };
    }
    // asserting that acc[currencyKey] exists
    acc[currencyKey]!.total += value;

    return acc;
  }, {});
};

/**
 * Summarize transactions by currency and frequency
 *
 * @param transactions The transactions to summarize
 * @returns An object that contains the summarized transactions and the frequency of transactions per week
 */
export const summarizeTransactions = (transactions: Transaction[]) => {
  const deposits = transactions.filter((transaction) => transaction.transfer === "in");
  const withdrawals = transactions.filter((transaction) => transaction.transfer === "out");

  const depositSummaries = summarizeByCurrency(deposits);
  const withdrawalSummaries = summarizeByCurrency(withdrawals);

  // Calculate frequency of transactions per week
  const depositFrequencies = deposits.reduce((acc: { [key: number]: number }, deposit) => {
    const weekNumber = deposit.date ? getWeekNumber(deposit.date) : 0;
    acc[weekNumber] = (acc[weekNumber] || 0) + 1;
    return acc;
  }, {});

  const withdrawalFrequencies = withdrawals.reduce((acc: { [key: number]: number }, withdrawal) => {
    const weekNumber = withdrawal.date ? getWeekNumber(withdrawal.date) : 0;
    acc[weekNumber] = (acc[weekNumber] || 0) + 1;
    return acc;
  }, {});

  return {
    depositsByCurrency: depositSummaries,
    withdrawalsByCurrency: withdrawalSummaries,
    depositFrequencies,
    withdrawalFrequencies,
  };
};
