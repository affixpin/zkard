export interface Transaction {
  id: string;
  value: number;
  date: string;
  description: string;
  signature: string | null;
  userId: string;
}
