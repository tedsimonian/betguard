"use client";

import { useAtomValue } from "jotai";
import { isEmpty } from "lodash";
import { capitalizeString, formatNumber } from "@/lib/utils";
import { wallet_atom } from "@/state/atoms/wallet-atom";
import { InfoCard } from "../ui/card";
import { AssetTable } from "../ui/table/asset-table";
import { DepositerTable } from "../ui/table/depositer-table";

export const WalletInfo = () => {
  const wallet = useAtomValue(wallet_atom);

  if (!wallet || isEmpty(wallet.account)) return null;

  return (
    <div className="flex w-full flex-col gap-4 rounded-lg bg-gray-700 p-4 shadow-md">
      <div className="grid grid-cols-2 gap-4">
        <InfoCard title="Address" content={wallet.account} />
        <InfoCard
          title="Current XRP Balance"
          content={`${formatNumber(wallet.balance.value)} ${wallet.balance.currency}`}
        />
        <InfoCard title="Custodial" content={capitalizeString(wallet.is_custodial)} />
        <InfoCard title="KYC Verified" content={wallet.is_xumm_kyc_approved ? "Yes" : "No"} />
      </div>
      {wallet.depositing_accounts && (
        <div>
          <DepositerTable rows={wallet.depositing_accounts} />
        </div>
      )}
      <div>
        <AssetTable rows={wallet.assets} />
      </div>
    </div>
  );
};
