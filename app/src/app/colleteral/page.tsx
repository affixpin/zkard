"use client";

import Link from "next/link";
import { Key, Menu, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";

import type { SignatureRequest } from "../api/signature-requests/entity";

export default function Dashboard() {
	const { data } = useQuery({
		queryKey: ["signature-requests"],
		queryFn: async () => {
			const response = await fetch("/api/signature-requests?userId=root");
			const json = await response.json();
			return json as SignatureRequest[];
		},
	});

	return (
		<div className="flex min-h-screen w-full flex-col">
			<header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
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
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="shrink-0 md:hidden"
						>
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle navigation menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left">
						<nav className="grid gap-6 text-lg font-medium">
							<Link
								href="#"
								className="flex items-center gap-2 text-lg font-semibold"
							>
								<Package2 className="h-6 w-6" />
								<span className="sr-only">Acme Inc</span>
							</Link>
							<Link href="#" className="hover:text-foreground">
								Dashboard
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								Orders
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								Products
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								Customers
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								Analytics
							</Link>
						</nav>
					</SheetContent>
				</Sheet>
			</header>
			<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
				<div className="grid gap-4 md:gap-8 lg:grid-cols-2 ">
					<Card x-chunk="dashboard-01-chunk-5">
						<CardHeader>
							<CardTitle>Signature requests</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-8">
							{data?.map((tx) => (
								<div className="flex items-center gap-4">
									<Key className="h-6 w-6" />
									<div className="grid gap-1">
										<p className="text-sm font-medium leading-none">
											{tx.description}
										</p>
										<p className="text-sm text-muted-foreground">{tx.date}</p>
									</div>
									<div className="ml-auto font-medium">{tx.value}</div>
									<div className="ml-auto font-medium">
										{tx.signature ? "Approved ✅" : <Button>Approve</Button>}
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
