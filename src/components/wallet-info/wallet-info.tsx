"use client";

import { useAtomValue } from "jotai";
import { isEmpty } from "lodash";
import { walletAtom } from "@/state/atoms/wallet-atom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card/card";

export const WalletInfo = () => {
  const wallet = useAtomValue(walletAtom);

  if (!wallet || isEmpty(wallet.address)) return null;

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Address: {wallet.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <CardDescription>Assets: {JSON.stringify(wallet.assets, null, 2)}</CardDescription>
        </CardContent>
        <CardFooter>
          <CardDescription>Transactions</CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
};
