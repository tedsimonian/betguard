import { createContext } from "react";
import { Client } from "xrpl";

type XRPLClientContextType = {
  client: Client | null;
  connected: boolean;
};

export const XRPLClientContext = createContext<XRPLClientContextType>({
  client: null!,
  connected: false,
});
