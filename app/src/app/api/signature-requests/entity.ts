export interface SignatureRequest {
	id: string;
	value: number;
	date: string;
	description: string;
	signature: string | null;
	userId: string;
}
