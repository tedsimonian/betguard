import { useEffect, useMemo, useState } from "react";
import { Client } from "xrpl";
import { Networks } from "@/constants";
import { XRPLClientContext } from "../contexts/xrpl-client-context/xrpl-client-context";

export function XRPLClient({ children, network = Networks.Testnet }: { children: React.ReactNode; network?: string }) {
  const [connected, setConnected] = useState(false);
  const client = useMemo(() => {
    return new Client(network);
  }, [network]);

  useEffect(() => {
    console.log("connecting...");
    client.connect();

    const onConnected = () => {
      console.log("connected");
      setConnected(true);
    };

    const onDisconnected = () => {
      console.log("disconnected");
      setConnected(false);
    };

    client.on("connected", onConnected);
    client.on("disconnected", onDisconnected);

    return () => {
      console.log("disconnecting...");
      setConnected(false);

      client.off("connected", onConnected);
      client.off("disconnected", onDisconnected);

      client.disconnect();
    };
  }, [client]);

  return (
    <XRPLClientContext.Provider
      value={{
        client,
        connected,
      }}
    >
      {children}
    </XRPLClientContext.Provider>
  );
}
