export interface SignatureRequest {
	id: string;
	value: string;
	date: string;
	description: string;
	signature: string | null;
	userId: string;
}
