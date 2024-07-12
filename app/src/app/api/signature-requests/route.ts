import { signatureRequestsDb } from "./db";
import { SignatureRequest } from "./entity";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	if (!userId) return Response.json([]);

	const db = await signatureRequestsDb();

	const userTxs = db.data.signatureRequests.filter(
		(tx: SignatureRequest) => tx.userId === userId
	);

	return Response.json(userTxs);
}
