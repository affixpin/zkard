import { usersDB } from "./db";
import { getPositions } from "./positions/getPositions";

async function updateCollateral() {
  const db = await usersDB();
  for (const user of db.data.users) {
    if (!user.defiAddress) continue;
    const positions = await getPositions(user.id);
    user.defiCollateral = positions.reduce(
      (acc, position) => acc + position.balance,
      0
    );
    user.defiCollateralEnabled = positions.reduce(
      (acc, position) => acc + (position.enabled ? position.balance : 0),
      0
    );
    user.creditLimit = user.defiCollateralEnabled;
  }
  await db.write();
}

export async function usersService() {
  setInterval(() => {
    updateCollateral();
  }, 5000);
}
