export interface SignatureRequest {
	value: string;
	date: string;
	description: string;
	signature: string | null;
	userId: string;
}
