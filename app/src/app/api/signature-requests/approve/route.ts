import { usersDB } from "../../users/db";
import { signatureRequestsDb } from "../db";

export async function POST(request: Request) {
	const { id, signature } = await request.json();

	const srdb = await signatureRequestsDb();

	const index = srdb.data.signatureRequests.findIndex((sr) => sr.id === id);

	srdb.data.signatureRequests[index].signature = signature;

	const udb = await usersDB();

	const user = udb.data.users.find(
		(user) => user.id === srdb.data.signatureRequests[index].userId
	);
	if (!user) return Response.json(null);

	const availableBalance = user?.balance + user.creditLimit - user.creditSpent;
	if (availableBalance < srdb.data.signatureRequests[index].value)
		return Response.json("Not enough balance", { status: 400 });
	user.creditSpent += srdb.data.signatureRequests[index].value;

	await udb.write();

	return Response.json("ok");
}
