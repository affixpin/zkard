"use client";

import Link from "next/link";
import { Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

import type { SignatureRequest } from "../api/signature-requests/entity";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";

export default function Dashboard() {
	const { isConnected } = useAccount();
	const { signMessageAsync } = useSignMessage();

	const { data, refetch } = useQuery({
		queryKey: ["signature-requests"],
		queryFn: async () => {
			const response = await fetch("/api/signature-requests?userId=root");
			const json = await response.json();
			return json as SignatureRequest[];
		},
		refetchInterval: 500,
	});

	return (
		<div className="flex min-h-screen w-full flex-col">
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
							href="/colleteral"
							className="text-foreground transition-colors hover:text-foreground"
						>
							Colleteral
						</Link>
					</nav>
				</div>
				<div>
					<ConnectButton />{" "}
				</div>
			</header>
			<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
				<div className="grid gap-4 md:gap-8 lg:grid-cols-2 ">
					<Card x-chunk="dashboard-01-chunk-5">
						<CardHeader>
							<CardTitle>Signature requests</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-8">
							{data?.map((sr) => (
								<div className="flex items-center gap-4">
									<Key className="h-6 w-6" />
									<div className="grid gap-1">
										<p className="text-sm font-medium leading-none">
											{sr.description}
										</p>
										<p className="text-sm text-muted-foreground">{sr.date}</p>
									</div>
									<div className="ml-auto font-medium">{sr.value}</div>
									<div className="ml-auto font-medium">
										{sr.signature ? (
											"Approved ✅"
										) : (
											<Button
												onClick={async () => {
													if (!isConnected) alert("Connect your wallet first");
													const signature = await signMessageAsync({
														message: { raw: sr.id ?? "id" },
													});
													await fetch("/api/signature-requests/approve", {
														method: "POST",
														body: JSON.stringify({
															id: sr.id,
															signature: signature,
														}),
													});
													refetch();
												}}
											>
												Approve
											</Button>
										)}
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
