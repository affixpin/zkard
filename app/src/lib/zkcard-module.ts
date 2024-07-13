import { encodeAbiParameters } from "viem";

import { SafeSmartAccountClient } from "./permissionless";

export const zkModuleAddress = "0xF1aE317941efeb1ffB103D959EF58170F1e577E0";

export const install7579Module = async (safe: SafeSmartAccountClient) => {
  const context = encodeAbiParameters(
    [
      { name: "hookType", type: "uint256" },
      { name: "selector", type: "bytes4" },
      { name: "initData", type: "uint256" },
    ],
    [0n, "0x00000000", 4n]
  ); 

  try {
    const txHash = await safe.installModule({
      type: "hook",
      address: "0x58DC82532971Ef5CD8d6Fe1F6B4558c42F95e571",
      context,
    });

    return txHash;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
