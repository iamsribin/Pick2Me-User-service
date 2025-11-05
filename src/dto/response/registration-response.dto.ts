import { Expose } from 'class-transformer';

export class RegisterResponseDto {
  @Expose()
  name!: string;

  @Expose()
  role!: string;

  @Expose()
  id!: string;

  @Expose()
  data?: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    referral_code: string;
    joining_date: Date;
  };
}

export class CheckUserResponseDto {
  @Expose()
  message!: string;

  @Expose()
  token!: string;

  @Expose()
  userExists?: boolean;
}

export class ResendOtpResponseDto {
  @Expose()
  message!: string;
}
