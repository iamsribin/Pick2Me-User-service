 export interface IUserDto {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  userImage: string;
  referral_code: string;
  account_status: string;
  balance: number;
  total_transactions: number;
  completed_rides: number;
  cancelled_rides: number;
  joiningDate: string;
  reason: string;
}

export interface IUserProfileGrpcResponse {
  message: string;
  data: IUserDto;
}