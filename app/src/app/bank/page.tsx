"use client";

import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CreditCard } from "./credit-card";
import type { Transaction } from "../api/transactions/entity";
import type { User } from "../api/users/entity";
import { useAtomValue } from "jotai/react";
import { userIdAtom } from "../state/userId";

export default function Bank() {
	const userId = useAtomValue(userIdAtom);

	const { data: transactions } = useQuery({
		queryKey: ["transactions", userId],
		queryFn: async () => {
			const response = await fetch("/api/transactions?userId=" + userId);
			const json = await response.json();
			return json as Transaction[];
		},
		refetchInterval: 1000,
	});

	const { data: user } = useQuery({
		queryKey: ["user", userId],
		queryFn: async () => {
			const response = await fetch("/api/users?id=" + userId);
			const json = await response.json();
			return json as User;
		},
		refetchInterval: 1000,
	});

	return (
		<main className="flex flex-1 flex-col gap-4 p-4">
			<div className="grid gap-4 md:gap-4 lg:grid-cols-3">
				<div>
					<CreditCard
						number={user?.card.number ?? ""}
						expiry={user?.card.expiry ?? ""}
					/>
					<div className="flex gap-4 mt-4">
						<Card className="w-[100%]">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Available</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									$
									{(
										(user?.balance ?? 0) +
										(user?.creditLimit ?? 0) -
										(user?.creditSpent ?? 0)
									).toFixed(2)}
								</div>
							</CardContent>
						</Card>
						<Card className="w-[100%]">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									DeFi Collateral
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									${user?.defiCollateral.toFixed(2)}
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="flex gap-4 mt-4">
						<Card className="w-[100%]">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Credit Limit
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									${user?.creditLimit.toFixed(2)}
								</div>
							</CardContent>
						</Card>
						<Card className="w-[100%]">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Credit Limit Used
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">${user?.creditSpent.toFixed(2)}</div>
							</CardContent>
						</Card>
					</div>
				</div>
				<Card className="col-span-2">
					<CardHeader>
						<CardTitle>Transactions</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-8">
						{transactions?.map((tx) => (
							<div key={tx.id} className="flex items-center gap-4">
								<ShoppingCart className="h-6 w-6" />
								<div className="grid gap-1">
									<p className="text-sm font-medium leading-none">
										{tx.description}
									</p>
									<p className="text-sm text-muted-foreground">{tx.date}</p>
								</div>
								<div className="ml-auto font-medium">{tx.value}</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
