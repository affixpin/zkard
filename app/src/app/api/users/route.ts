import { usersDB } from "./db";
import { User } from "./entity";
import { usersService } from "./service";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) return Response.json(null);

	const db = await usersDB();

	const user = db.data.users.find((user: User) => user.id === id);

	if (!user) {
		db.data.users.push({
			id,
			balance: 0,
			creditLimit: 0,
			creditSpent: 0,
			defiCollateral: 0,
			defiCollateralEnabled: 0,
			card: {
				number: "1111 2222 3333 4444",
				expiry: "04/20",
			},
			positions: {},
		});
		await db.write();
	}

	return Response.json(user);
}

export async function PUT(request: Request) {
	const { id, defiAddress } = await request.json();

	if (!id) return Response.json(null);

	const db = await usersDB();

	const user = db.data.users.find((user: User) => user.id === id);
	if (!user) return Response.json(null);
	user.defiAddress = defiAddress as `0x${string}`;
	await db.write();

	return Response.json(user);
}

usersService();
