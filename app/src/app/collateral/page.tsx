"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Key, WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useSignMessage, useWriteContract } from "wagmi";
import { useAtomValue } from "jotai/react";
import { Switch } from "@/components/ui/switch";

import type { SignatureRequest } from "../api/signature-requests/entity";
import { userIdAtom } from "../state/userId";
import { User } from "../api/users/entity";
import type { Position } from "../api/users/positions/route";
import { InstallSafe } from "./install-safe";
import { zkModuleAbi } from "./zkard-module-artifact";

export default function Collateral() {
	const { isConnected } = useAccount();
	const { signMessageAsync } = useSignMessage();
	const userId = useAtomValue(userIdAtom);

	const { writeContract } = useWriteContract();

	const { data, refetch } = useQuery({
		queryKey: ["signature-requests", userId],
		queryFn: async () => {
			const response = await fetch("/api/signature-requests?userId=" + userId);
			const json = await response.json();
			return json as SignatureRequest[];
		},
		refetchInterval: 1000,
	});

	const { data: user, refetch: refetchUser } = useQuery({
		queryKey: ["user", userId],
		queryFn: async () => {
			const response = await fetch("/api/users?id=" + userId);
			const json = await response.json();
			return json as User;
		},
		refetchInterval: 1000,
	});

	const { data: positions } = useQuery({
		queryKey: ["positions", userId],
		queryFn: async () => {
			const response = await fetch("/api/users/positions?userId=" + userId);
			const json = await response.json();
			return json as Position[];
		},
		refetchInterval: 5000,
	});

	if (!isConnected) {
		return (
			<main className="flex justify-center flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
				<div className="flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-md text-center">
						<h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
							Connect your wallet
						</h1>
						<p className="mt-4 text-muted-foreground">
							Collateralize your assets to get a loan
						</p>
						<div className="flex justify-center mt-6">
							<ConnectButton />
						</div>
					</div>
				</div>
			</main>
		);
	}

	if (!user?.defiAddress) {
		return <InstallSafe refetchUser={refetchUser} />;
	}

	return (
		<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
			<div className="grid gap-4 md:gap-8 lg:grid-cols-2 ">
				<Card x-chunk="dashboard-01-chunk-5">
					<CardHeader>
						<CardTitle>Signature requests</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-8">
						{data?.map((sr) => (
							<div key={sr.id} className="flex items-center gap-4">
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
													message: { raw: sr.id as any },
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
				<div className="flex flex-col gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center gap-4">
							<img
								width={100}
								height={100}
								src="https://repository-images.githubusercontent.com/337806885/6678abd2-1351-4e63-9a3e-3972927696e5"
							/>
							<CardTitle>Smart Wallet</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-4">
							<h1>Address: {user?.defiAddress}</h1>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center gap-4">
							<WalletIcon className="w-8 h-8" />
							<div className="grid gap-1">
								<CardTitle>DeFi Positions</CardTitle>
								<CardDescription>Manage your active positions</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="grid gap-4">
							<div className="grid gap-2">
								<div className="flex flex-col gap-4 items-center justify-between">
									{positions?.map((position, i) => {
										return (
											<div
												key={position.id}
												className="flex items-center justify-between gap-2 w-[100%]"
											>
												<div className="flex items-center gap-4">
													<img width={50} height={50} src={position.logoURL} />
													<div className="font-medium">{position.id}</div>
												</div>
												<div className="text-right">
													<div className="font-medium">
														${position.balance.toFixed(2)}
													</div>
												</div>
												<Switch
													defaultChecked={position.enabled}
													onCheckedChange={(enabled) => {
														fetch("/api/users/positions", {
															method: "PUT",
															body: JSON.stringify({
																userId: userId,
																positionId: position.id,
																enabled,
															}),
														});
														writeContract({
															abi: zkModuleAbi,
															address:
																"0x6b175474e89094c44da98b954eedeac495271d0f",
															functionName: "addCollateral",
															args: [i],
														});
													}}
													className="rounded-full bg-muted w-10 h-5 relative"
												>
													<div className="bg-background w-4 h-4 rounded-full absolute left-0.5 top-0.5 transition-all duration-200 ease-in-out" />
												</Switch>
											</div>
										);
									})}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}
