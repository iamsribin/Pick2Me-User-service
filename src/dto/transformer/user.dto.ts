import { Expose } from 'class-transformer';

export class UserDto {
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
  joiningDate!: string;
}
