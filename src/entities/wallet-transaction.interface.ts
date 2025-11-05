export interface IWalletTransaction {
  id: string;
  transaction_id: string;
  date: Date;
  details: string;
  ride_id: string;
  amount: number;
  status: 'Debit' | 'Credit';
  user: string;
}
