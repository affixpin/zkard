import { randomBytes } from "crypto";
import { usersDB } from "../../users/db";
import { signatureRequestsDb } from "../db";
import { transactionsDB } from "../../transactions/db";

export async function POST(request: Request) {
  const { id, signature } = await request.json();

  const srdb = await signatureRequestsDb();

  const index = srdb.data.signatureRequests.findIndex((sr) => sr.id === id);

  const udb = await usersDB();

  const user = udb.data.users.find(
    (user) => user.id === srdb.data.signatureRequests[index].userId
  );
  if (!user) return Response.json(null);

  const availableBalance = user?.balance + user.creditLimit - user.creditSpent;
  const txValue = srdb.data.signatureRequests[index].value;
  if (availableBalance < txValue) {
    return Response.json("Not enough balance", { status: 400 });
  }

  srdb.data.signatureRequests[index].signature = signature;

  user.creditSpent += txValue;

  const txdb = await transactionsDB();

  txdb.data.transactions.unshift({
    date: new Date().toISOString(),
    userId: user.id,
    value: txValue,
    description: "Spent via zkard.shop",
    id: randomBytes(16).toString("hex"),
    signature: signature,
  });

  await txdb.write();
  await udb.write();

  return Response.json("ok");
}
