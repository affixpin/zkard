import { useEffect } from "react";
import { install7579Module } from "@/lib/zkcard-module";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";

import { safeAtom } from "../state/safe";
import { userIdAtom } from "../state/userId";

export const InstallSafe: React.FC<{ refetchUser: () => {} }> = ({
	refetchUser,
}) => {
	const userId = useAtomValue(userIdAtom);
	const safe = useAtomValue(safeAtom);

	useEffect(() => {
		if (!safe) return;
		const init7579Module = async () => {
			await safe
				.isModuleInstalled({
					type: "hook",
					address: "0x01848Bcc1E983C63062Dcc7D87df5147F0e0AD16",
					context: "0x",
				})
				.catch(() => false);
		};
		void init7579Module();
	}, [safe]);

	if (!safe) return "Loading...";

	return (
		<main className="flex justify-center flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
			<div className="flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-md text-center">
					<img src="https://repository-images.githubusercontent.com/337806885/6678abd2-1351-4e63-9a3e-3972927696e5" />
					<h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Create smart wallet
					</h1>
					<p className="mt-4 text-muted-foreground">
						Collateralize your assets to get a loan
					</p>
					<div className="flex justify-center mt-6">
						<Button
							onClick={async () => {
								// temporary
								if (!safe) return;

								await install7579Module(safe);

								await fetch("/api/users", {
									method: "PUT",
									body: JSON.stringify({
										id: userId,
										defiAddress: safe.account.address,
									}),
								});
								refetchUser();
							}}
						>
							Create!
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
};
