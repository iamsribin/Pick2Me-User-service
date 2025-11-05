import {
  RegisterResponseDto,
  CheckUserResponseDto,
  ResendOtpResponseDto,
} from '../../dto/response/registration-response.dto';
import {
  SignupRequestDto,
  CheckUserRequestDto,
  ResendOtpRequestDto,
} from '../../dto/request/registration-request.dto';
import { NextFunction } from 'express';

export type ControllerCallback<T> = (error: Error | null, response?: T) => void;

export interface IRegistrationController {
  signup(
    call: { request: SignupRequestDto },
    callback: ControllerCallback<RegisterResponseDto>
  ): Promise<void>;

  checkUser(
    call: { request: CheckUserRequestDto },
    callback: ControllerCallback<CheckUserResponseDto>
  ): Promise<void>;

  resendOtp(
    call: { request: ResendOtpRequestDto },
    callback: ControllerCallback<ResendOtpResponseDto>
  ): Promise<void>;

  refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}
