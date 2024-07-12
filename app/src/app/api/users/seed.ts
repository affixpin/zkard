import { User } from "./entity";

export const usersSeed: User[] = [
	{
		id: "root",
		balance: 1000,
		creditLimit: 1000,
		creditSpent: 100,
		defiColleteral: 100,
		card: {
			number: "1111 2222 3333 4444",
			expiry: "04/20",
		},
	},
];
