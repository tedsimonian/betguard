"use client";

import { useAtomValue } from "jotai";
import { isEmpty } from "lodash";
import { wallet_atom } from "@/state/atoms/wallet-atom";
import { Asset } from "@/types/common";
import { CodeBlock } from "../ui/block/code_block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card/card";

export const WalletInfo = () => {
  const wallet = useAtomValue(wallet_atom);

  if (!wallet || isEmpty(wallet.account)) return null;

  const formatCurrency = (currency: Asset) => {
    return `${currency.value} ${currency.currency} (Issuer: ${currency.issuer})`;
  };

  return (
    <div className="w-full rounded-lg bg-gray-700 p-4 shadow-md">
      <Card>
        <CardHeader className="text-white">
          <CardTitle>Wallet Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <CardDescription className="font-bold">Address:</CardDescription>
            <CardDescription>{wallet.account}</CardDescription>
          </div>
          <div className="mb-4">
            <CardDescription className="font-bold">XRP Balance:</CardDescription>
            <CardDescription>
              {wallet.balance.value} {wallet.balance.currency}
            </CardDescription>
          </div>
          <div className="mb-4">
            <CardDescription className="font-bold">Assets:</CardDescription>
            <ul className="list-disc pl-5">
              {wallet.assets.map((asset, index) => (
                <li key={index}>{formatCurrency(asset)}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <CardDescription className="font-bold">Custodial:</CardDescription>
            <CardDescription>{wallet.is_custodial}</CardDescription>
          </div>
          <div className="mb-4">
            <CardDescription className="font-bold">KYC Verified:</CardDescription>
            <CardDescription>{wallet.is_xumm_kyc_approved ? "Yes" : "No"}</CardDescription>
          </div>
          {wallet.depositing_accounts && (
            <div className="mb-4">
              <CardDescription className="font-bold">Depositing Accounts:</CardDescription>
              <CodeBlock content={JSON.stringify(wallet.depositing_accounts, null, 2)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
