import { xrplClient } from "./xrpl-client";

export const getAddressBalance = async (address: string) => {
  try {
    await xrplClient.connect();
    const balance = await xrplClient.getXrpBalance(address);
    return balance;
  } catch (e) {
    console.error(e);
    return 0;
  } finally {
    await xrplClient.disconnect();
  }
};

export const getAddressInfo = async (address: string) => {
  try {
    await xrplClient.connect();
    const info = await xrplClient.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
    return info;
  } catch (e) {
    console.error(e);
    return null;
  } finally {
    await xrplClient.disconnect();
  }
};
