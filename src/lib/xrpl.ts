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
import { isSameDay } from "./utils";

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

export const fetchLastSevenDayTransactionHistory = async (
  walletAddress: string,
  type: RippleTransaction["TransactionType"] = "Payment",
  limit: number | undefined = undefined
) => {
  let complete = false;
  let marker: AccountTxRequest["marker"] = undefined;
  const all_filtered_tx_history: AccountTxTransaction[] = [];

  // Calculate the date 7 days ago
  const seven_days_ago = new Date();
  seven_days_ago.setDate(seven_days_ago.getDate() - 7);

  while (!complete) {
    try {
      console.log("Fetching transactions...");
      const tx_response = await request<AccountTxRequest, AccountTxResponse>({
        command: "account_tx",
        account: walletAddress,
        ledger_index: "validated",
        ledger_index_max: -1,
        ledger_index_min: -1,
        limit,
        marker,
      });

      // Temporary array to hold transactions for this fetch iteration
      const current_iteration_transactions = [];

      for (const transaction of tx_response.result.transactions) {
        // Ensure the transaction type matches
        if (transaction.tx?.TransactionType !== type) {
          continue;
        }

        // Convert Ripple Epoch to JavaScript Date
        const transaction_date = transaction.tx.date ? new Date(rippleTimeToISOTime(transaction.tx.date)) : null;

        // If the transaction is older than 7 days, set complete to true and break the loop
        if (transaction_date && transaction_date < seven_days_ago) {
          complete = true;
          break;
        }

        // If the transaction is within the last 7 days, add it to the current iteration's transactions
        current_iteration_transactions.push(transaction);
      }

      console.log("Appending filtered transactions...");
      all_filtered_tx_history.push(...current_iteration_transactions);

      console.log("Updated marker for next request...");
      // Update marker for next request
      marker = tx_response.result.marker;

      console.log("Checking if we are at the end of the data...");
      // If there's no marker or we've already added transactions older than 7 days, we've reached the end of the data
      complete = complete || !marker;
    } catch (error) {
      console.error("Error fetching transaction history", error);
      throw error;
    }
  }

  return all_filtered_tx_history;
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

type DayRecord = {
  date: Date;
  amount: number;
  frequency: number;
};

type ProfitAndLoss = {
  gain: number;
  loss: number;
  net: number;
  percentage: number;
};

interface TransactionRecord {
  currency: string;
  deposits: DayRecord[];
  withdrawals: DayRecord[];
  pnl: ProfitAndLoss;
}

type Summary = TransactionRecord[];

/**
 * Summarize transactions passed in by their currency, and whether they are deposits or withdrawals
 *
 * @param transactions The transactions to summarize
 * @returns An array of summarized transactions
 */
export const summarizeTransactions = (transactions: Transaction[]): Summary => {
  const summarized_transactions: Summary = [];

  transactions.forEach((transaction) => {
    const { asset, date, transfer } = transaction;

    // Attempt to find an existing record for the currency of the current transaction
    let record = summarized_transactions.find((r) => r.currency === asset.currency);

    // If no existing record is found, create a new one and add it to the summarized_transactions array
    if (!record) {
      record = {
        currency: asset.currency,
        deposits: [],
        withdrawals: [],
        pnl: { gain: 0, loss: 0, net: 0, percentage: 0 },
      };
      summarized_transactions.push(record);
    }

    // Handle potential null or undefined date by defaulting to the current date
    const transaction_date = date || new Date();

    // Create a new day record for the transaction
    const day_record: DayRecord = {
      date: transaction_date,
      amount: asset.value,
      frequency: 1,
    };

    // Determine if the transaction is a deposit (in) or withdrawal (out)
    if (transfer === "in") {
      // Attempt to find an existing deposit record for the same date
      const existing_deposit = record.deposits.find((d) => isSameDay(d.date, transaction_date));

      // If an existing deposit is found, increment its amount and frequency
      if (existing_deposit) {
        existing_deposit.amount += asset.value;
        existing_deposit.frequency += 1;
      } else {
        // If no existing deposit is found for the date, add the new day record to the deposits array
        record.deposits.push(day_record);
      }

      // Update the gain
      record.pnl.gain += asset.value;
    } else {
      // Attempt to find an existing withdrawal record for the same date
      const existing_withdrawal = record.withdrawals.find((w) => isSameDay(w.date, transaction_date));

      // If an existing withdrawal is found, increment its amount (note: amount is negative) and frequency
      if (existing_withdrawal) {
        existing_withdrawal.amount += asset.value; // Since amount is negative for withdrawals
        existing_withdrawal.frequency += 1;
      } else {
        // If no existing withdrawal is found for the date, add the new day record to the withdrawals array
        record.withdrawals.push(day_record);
      }

      // Update the loss
      record.pnl.loss += asset.value;
    }
  });

  // Calculate the net profit and percentage for each record
  summarized_transactions.forEach((record) => {
    record.pnl.net = record.pnl.gain - record.pnl.loss;
    // A positive percentage indicates a gain, while a negative percentage indicates a loss
    record.pnl.percentage = (record.pnl.net / record.pnl.gain) * 100;
  });

  // Return the summarized transactions
  return summarized_transactions;
};
