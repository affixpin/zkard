import { usersDB } from "./db";
import { User } from "./entity";

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
			defiColleteral: 0,
			card: {
				number: "1111 2222 3333 4444",
				expiry: "04/20",
			},
		});
		await db.write();
	}

	return Response.json(user);
}
