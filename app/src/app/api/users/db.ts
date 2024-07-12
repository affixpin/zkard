import { JSONFilePreset } from "lowdb/node";
import { Low } from "lowdb";

import { usersSeed } from "./seed";
import { User } from "./entity";

let db: Low<{ users: User[] }> | null = null;

export const usersDB = async () => {
	if (db) return db;

	db = await JSONFilePreset("users.json", {
		users: usersSeed,
	});

	return db;
};
