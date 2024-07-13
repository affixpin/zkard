import { createPublicClient, formatUnits, getContract, http } from "viem";

import { usersDB } from "../db";
import { User } from "../entity";

export interface Position {
	id: string;
	logoURL: string;
	enabled: boolean;
	balance: number;
}

const polygon = {
	getProxyUSD: async (address: `0x${string}`) => {
		const maticPrice = 0.5;
		const providerURL = "https://polygon-rpc.com";
		const client = createPublicClient({
			transport: http(providerURL),
		});
		const balance = await client.getBalance({ address });
		const balanceFloat = parseFloat(formatUnits(balance, 18));
		return balanceFloat * maticPrice;
	},
	id: "Polygon MATIC",
	logoURL: "https://cryptologos.cc/logos/polygon-matic-logo.png",
};

const cirle = {
	getProxyUSD: async (address: `0x${string}`) => {
		const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

		const abi = [
			{
				constant: true,
				inputs: [
					{
						name: "_owner",
						type: "address",
					},
				],
				name: "balanceOf",
				outputs: [
					{
						name: "balance",
						type: "uint256",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
		] as const;

		const providerURL = "https://polygon-rpc.com";
		const client = createPublicClient({
			transport: http(providerURL),
		});
		const contract = getContract({
			address: usdcAddress,
			abi,
			client,
		});

		const balance = await contract.read.balanceOf([address]);

		const balanceFloat = parseFloat(formatUnits(balance, 6));
		return balanceFloat;
	},
	id: "Polygon Circle USDC",
	logoURL:
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/2048px-Circle_USDC_Logo.svg.png",
};

const apeCoin = {
	getProxyUSD: async (address: `0x${string}`) => {
		const usdcAddress = "0xB7b31a6BC18e48888545CE79e83E06003bE70930";

		const abi = [
			{
				constant: true,
				inputs: [
					{
						name: "_owner",
						type: "address",
					},
				],
				name: "balanceOf",
				outputs: [
					{
						name: "balance",
						type: "uint256",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
		] as const;

		const providerURL = "https://polygon-rpc.com";
		const client = createPublicClient({
			transport: http(providerURL),
		});
		const contract = getContract({
			address: usdcAddress,
			abi,
			client,
		});

		const balance = await contract.read.balanceOf([address]);
		const balanceFloat = parseFloat(formatUnits(balance, 6));
		return balanceFloat;
	},
	id: "ApeCoin",
	logoURL:
		"https://img.bitgetimg.com/multiLang/coinPriceLogo/25608447a790af93320543724174878a1701537690449.png",
};

const positionConfigs = [polygon, cirle, apeCoin];

export async function getPositions(userId: string) {
	const db = await usersDB();
	const user = db.data.users.find((user) => user.id === userId);

	return Promise.all(
		positionConfigs.map(async (config) => {
			const balance = user?.defiAddress
				? await config.getProxyUSD(user.defiAddress)
				: 0;

			return {
				enabled: Boolean(user?.positions?.[config.id]),
				balance,
				id: config.id,
				logoURL: config.logoURL,
			};
		})
	);
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	if (!userId) return Response.json(null);

	const positions = await getPositions(userId);

	return Response.json(positions);
}

export async function PUT(request: Request) {
	const { userId, positionId, enabled } = await request.json();

	if (!userId) return Response.json(null);

	const db = await usersDB();
	const user = db.data.users.find((user: User) => user.id === userId);
	if (!user) return Response.json(null);
	user.positions = { ...(user?.positions ?? {}), [positionId]: enabled };
	await db.write();

	return Response.json("ok");
}
