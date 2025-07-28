import { Expose } from "class-transformer";

export class UserProfileResponseDto {
  @Expose()
  _id!: string;
  @Expose()
  name!: string;
  @Expose()
  email!: string;
  @Expose()
  mobile!: string;
  @Expose()
  userImage!: string;
  @Expose()
  referral_code!: string;
  @Expose()
  account_status!: string;
  @Expose()
  balance!: number;
  @Expose()
  total_transactions!: number;
  @Expose()
  completed_rides!: number;
  @Expose()
  cancelled_rides!: number;
  @Expose()
  joiningDate!: string;
  @Expose()
  reason!: string;
}
