"use client";

import Link from "next/link";
import { ShoppingCart, Menu, Package2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { CreditCard } from "./credit-card";
import type { Transaction } from "../api/transactions/entity";
import type { User } from "../api/users/entity";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Page() {
	const { data: transactions } = useQuery({
		queryKey: ["transactions"],
		queryFn: async () => {
			const response = await fetch("/api/transactions?userId=root");
			const json = await response.json();
			return json as Transaction[];
		},
	});

	const { data: user } = useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			const response = await fetch("/api/users?id=root");
			const json = await response.json();
			return json as User;
		},
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
									<CardTitle className="text-sm font-medium">
										Available
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">${user?.balance}</div>
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
										${user?.defiColleteral}
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
									<div className="text-2xl font-bold">${user?.creditLimit}</div>
								</CardContent>
							</Card>
							<Card className="w-[100%]">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Credit Limit Used
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">${user?.creditSpent}</div>
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
		</div>
	);
}
