"use client";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { userIdAtom } from "./state/userId";
import { useAtom } from "jotai/react";

export function Header() {
  const [_, setUserId] = useAtom(userIdAtom);

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            zkard
          </Link>
          <Link
            href="/bank"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Bank
          </Link>
          <Link
            href="/collateral"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Collateral
          </Link>
        </nav>
      </div>
      <div className="flex gap-4">
        <ConnectButton />
        <Button onClick={() => {
          setUserId("");
        }}>Logout</Button>
      </div>
    </header>
  );
}
