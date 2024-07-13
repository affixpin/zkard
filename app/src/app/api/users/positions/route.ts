import { usersDB } from "../db";
import { User } from "../entity";
import { getPositions } from "./getPositions";

export interface Position {
  id: string;
  logoURL: string;
  enabled: boolean;
  balance: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return Response.json(null);

  const positions = await getPositions(userId);

  return Response.json(positions);
}

export async function PUT(request: Request) {
  const { userId, positionId, enabled } = await request.json();

  if (!userId) return Response.json(null);

  const db = await usersDB();
  const user = db.data.users.find((user: User) => user.id === userId);
  if (!user) return Response.json(null);
  user.positions = { ...(user?.positions ?? {}), [positionId]: enabled };
  await db.write();

  return Response.json("ok");
}
