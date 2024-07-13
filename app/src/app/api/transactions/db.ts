import { JSONFilePreset } from "lowdb/node";
import { Low } from "lowdb";

import { transactionsSeed } from "./seed";
import { Transaction } from "./entity";

let db: Low<{ transactions: Transaction[] }> | null = null;

export const transactionsDB = async () => {
  if (db) return db;
  db = await JSONFilePreset(process.env.DB_PATH + "/transactions.json", {
    transactions: transactionsSeed,
  });
  return db;
};
