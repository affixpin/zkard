import { createPublicClient, http, Chain, Transport } from "viem";
import { sepolia } from "viem/chains";
import {
  ENTRYPOINT_ADDRESS_V07,
  createSmartAccountClient,
  SmartAccountClient,
} from "permissionless";
import {
  SafeSmartAccount,
  signerToSafeSmartAccount,
  SmartAccountSigner,
} from "permissionless/accounts";
import { erc7579Actions, Erc7579Actions } from "permissionless/actions/erc7579";
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import { EntryPoint } from "permissionless/types";

export type SafeSmartAccountClient = SmartAccountClient<
  EntryPoint,
  Transport,
  Chain,
  SafeSmartAccount<EntryPoint>
> &
  Erc7579Actions<EntryPoint, SafeSmartAccount<EntryPoint>>;

const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=0fba46fd-c61a-4cb1-bb36-68e24bffb07f`;
const safe4337ModuleAddress = "0x3Fdb5BC686e861480ef99A6E3FaAe03c0b9F32e2";
const erc7569LaunchpadAddress = "0xEBe001b3D534B9B6E2500FB78E67a1A137f561CE";

const publicClient = createPublicClient({
  transport: http("https://ethereum-sepolia.rpc.subquery.network/public"),
});

const paymasterClient = createPimlicoPaymasterClient({
  transport: http(pimlicoUrl),
  entryPoint: ENTRYPOINT_ADDRESS_V07,
});

const bundlerClient = createPimlicoBundlerClient({
  transport: http(pimlicoUrl),
  entryPoint: ENTRYPOINT_ADDRESS_V07,
});

export const getSmartAccountClient = async (
  signer: SmartAccountSigner<any, any>
) => {
  const account = await signerToSafeSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    signer,
    safeVersion: "1.4.1",
    saltNonce: 76n,
    erc7569LaunchpadAddress,
    safe4337ModuleAddress,
  });

  const smartAccountClient = createSmartAccountClient({
    chain: sepolia,
    account,
    bundlerTransport: http(pimlicoUrl),

    middleware: {
      gasPrice: async () =>
        (await bundlerClient.getUserOperationGasPrice()).fast,
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  }).extend(erc7579Actions({ entryPoint: ENTRYPOINT_ADDRESS_V07 }));

  return smartAccountClient as SafeSmartAccountClient;
};
