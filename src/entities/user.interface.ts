import { IWalletTransaction } from './wallet-transaction.interface';

export interface IUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  // password: string;
  user_image?: string;
  referral_code?: string;
  joining_date: Date;
  account_status: 'Good' | 'Block';
  reason?: string;
  role: 'Admin' | 'User';
  wallet_balance?: number;
  cancel_ride_count?: number;
  completed_ride_count?: number;
  transactions?: IWalletTransaction[];
}
