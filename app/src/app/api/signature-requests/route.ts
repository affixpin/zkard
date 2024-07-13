import * as crypto from "crypto";

import { signatureRequestsDb } from "./db";
import { SignatureRequest } from "./entity";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json([]);

  const db = await signatureRequestsDb();

  const userSR = db.data.signatureRequests.filter(
    (tx: SignatureRequest) => tx.userId === userId
  );

  return Response.json(userSR);
}

export async function POST(request: Request) {
  const { userId, value } = await request.json();

  const db = await signatureRequestsDb();

  db.data.signatureRequests.unshift({
    id: crypto.randomBytes(16).toString("hex"),
    value,
    date: new Date().toISOString(),
    description: "Spend at zkard.shop",
    signature: null,
    userId,
  });

  await db.write();

  return Response.json({ message: "CHINAZES))))" });
}
