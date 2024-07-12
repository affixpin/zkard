import { signatureRequestsDb } from "../db";

export async function POST(request: Request) {
	const { id, signature } = await request.json();

	const db = await signatureRequestsDb();

	const index = db.data.signatureRequests.findIndex((sr) => sr.id === id);

	db.data.signatureRequests[index].signature = signature;

	await db.write();

	return Response.json("ok");
}
