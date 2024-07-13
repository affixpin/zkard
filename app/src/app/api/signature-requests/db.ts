import { JSONFilePreset } from "lowdb/node";
import { Low } from "lowdb";

import { signatureRequestsSeed } from "./seed";
import { SignatureRequest } from "./entity";

let db: Low<{ signatureRequests: SignatureRequest[] }> | null = null;

export const signatureRequestsDb = async () => {
	if (db) return db;
	db = await JSONFilePreset(process.env.DB_PATH + "/signature-requests.json", {
		signatureRequests: signatureRequestsSeed,
	});
	return db;
};
