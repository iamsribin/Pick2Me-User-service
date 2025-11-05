import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @Expose()
  message!: string;

  @Expose()
  name!: string;

  @Expose()
  token!: string;

  @Expose()
  _id!: string;

  @Expose()
  role!: string;

  @Expose()
  refreshToken!: string;

  // @Expose()
  // mobile?: string;

  // @Expose()
  // profile?: string;
}
