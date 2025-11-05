import { Expose } from 'class-transformer';

export class UserProfileResponseDto {
  @Expose()
  id!: string;
  @Expose()
  name!: string;
  @Expose()
  email!: string;
  @Expose()
  mobile!: string;
  @Expose()
  user_image!: string;
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
  joining_date!: string;
  @Expose()
  reason!: string;
}
