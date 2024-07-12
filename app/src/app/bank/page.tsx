import Link from "next/link";
import { ShoppingCart, DollarSign, Menu, Package2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { transactions } from "./transactions.state";
import { CreditCard } from "./card";

export default function Dashboard() {
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
			<main className="flex flex-1 flex-col gap-4 p-4">
				<div className="grid gap-4 md:gap-4 lg:grid-cols-3">
					<div>
						<CreditCard />
						<div className="flex gap-4 mt-4">
							<Card className="w-[100%]">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Available
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">$1000</div>
								</CardContent>
							</Card>
							<Card className="w-[100%]">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										DeFi Collateral
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">$1000</div>
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
									<div className="text-2xl font-bold">$1000</div>
								</CardContent>
							</Card>
							<Card className="w-[100%]">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Credit Limit Used
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">$1000</div>
								</CardContent>
							</Card>
						</div>
					</div>
					<Card className="col-span-2">
						<CardHeader>
							<CardTitle>Transactions</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-8">
							{transactions.map((tx) => (
								<div className="flex items-center gap-4">
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
