import { usersDB } from "./db";
import { User } from "./entity";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) return Response.json(null);

	const db = await usersDB();

	const user = db.data.users.find((user: User) => user.id === id);

	return Response.json(user);
}
