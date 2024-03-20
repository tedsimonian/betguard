import { WalletInfo } from "@/components/wallet-info/wallet-info";
import { WalletLookupForm } from "@/components/wallet-lookup-form/wallet-lookup-form";
// import { XRPLClient } from "@/components/xrpl-client/xrpl-client";
// import { Networks } from "@/constants";

const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to the BetGuard</h1>
      <div className="py-4">Look up a wallet to see detailed info.</div>
      <div>
        <div className="flex w-full flex-col items-center gap-4">
          {/* <XRPLClient network={Networks.Devnet}> */}
          <WalletLookupForm />
          <WalletInfo />
          {/* </XRPLClient> */}
        </div>
      </div>
    </main>
  );
};

export default Home;
