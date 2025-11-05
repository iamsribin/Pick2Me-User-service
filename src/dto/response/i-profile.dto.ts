export interface IUserDto {
  id: string;
  name: string;
  email: string;
  mobile: string;
  user_image: string;
  referral_code: string;
  account_status: string;
  balance: number;
  total_transactions: number;
  completed_rides: number;
  cancelled_rides: number;
  joining_date: string;
  reason: string;
}

export interface IUserProfileGrpcResponse {
  message: string;
  data: IUserDto;
}
