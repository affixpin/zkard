import { transactionsDB } from "./db";
import { Transaction } from "./entity";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	if (!userId) return Response.json([]);

	const db = await transactionsDB();

	const userTxs = db.data.transactions.filter(
		(tx: Transaction) => tx.userId === userId
	);

	return Response.json(userTxs);
}
