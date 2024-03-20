import { useAtomValue } from "jotai";
import { walletAtom } from "@/state/atoms/wallet-atom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card/card";

export const WalletInfo = () => {
  const wallet = useAtomValue(walletAtom);

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Address: {wallet.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <CardDescription>Balance: {wallet.balance}</CardDescription>
        </CardContent>
        <CardFooter>
          <CardDescription>Transactions</CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
};
