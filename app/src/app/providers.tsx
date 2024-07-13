// In Next.js, this file would be called: app/providers.jsx
"use client";

// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { wagmiConfig } from "./wagmi";
import {
  WagmiProvider,
  useAccount,
  useClient,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { getSmartAccountClient } from "@/lib/permissionless";
import { useEffect } from "react";
import { useAtom } from "jotai";

import { safeAtom } from "./state/safe";
import { walletClientToSmartAccountSigner } from "permissionless";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({ children }: any) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeProvider />
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function SafeProvider() {
  const [_safe, setSafe] = useAtom(safeAtom);
  const wc = useWalletClient();

  useEffect(() => {
    if (!wc.data) return;

    const accountSigner = walletClientToSmartAccountSigner(wc.data);

    getSmartAccountClient(accountSigner)
      .then((safe) => {
        setSafe(safe);
      })
      .catch((e) => console.error("WTF???", e));
  }, [wc]);

  return <></>;
}
