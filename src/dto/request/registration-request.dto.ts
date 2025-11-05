export class SignupRequestDto {
  name!: string;
  email!: string;
  mobile!: string;
  password!: string;
  reffered_Code?: string;
  userImage?: string;
  otp!: string;
  token!: string;
}

export class CheckUserRequestDto {
  mobile!: string;
  email!: string;
  name!: string;
}

export class ResendOtpRequestDto {
  email!: string;
  name!: string;
}
export interface RegisterUserDataDto {
  name: string;
  email: string;
  mobile: string;
  // password: string;
  reffered_Code?: string;
  user_image?: string;
}
