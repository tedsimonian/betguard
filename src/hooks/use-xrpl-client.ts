import { useContext } from "react";
import { Client } from "xrpl";
import { XRPLClientContext } from "@/components/context/xrpl-client-content/xrpl-client-context";

export function useXRPLClient() {
  const xrplContext = useContext(XRPLClientContext);

  if (!xrplContext) {
    throw new Error("Make sure to use XRPLClientProvider to wrap your component tree");
  }

  return [xrplContext.client, xrplContext.connected] as [Client, boolean];
}
