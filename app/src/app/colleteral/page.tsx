"use client";

import { Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

import type { SignatureRequest } from "../api/signature-requests/entity";
import { useAccount, useSignMessage } from "wagmi";
import { useAtomValue } from "jotai/react";
import { userIdAtom } from "../state/userId";

export default function Colleteral() {
	const { isConnected } = useAccount();
	const { signMessageAsync } = useSignMessage();
	const userId = useAtomValue(userIdAtom);

	const { data, refetch } = useQuery({
		queryKey: ["signature-requests", userId],
		queryFn: async () => {
			const response = await fetch("/api/signature-requests?userId=" + userId);
			const json = await response.json();
			return json as SignatureRequest[];
		},
		refetchInterval: 500,
	});

	return (
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
	);
}
