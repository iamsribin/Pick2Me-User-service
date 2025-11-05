import { plainToClass } from 'class-transformer';
import {
  RegisterResponseDto,
  CheckUserResponseDto,
  ResendOtpResponseDto,
} from '../response/registration-response.dto';
import { ServiceResponse } from '../serviceResponse';

export class RegistrationTransformer {
  static transformToRegisterResponse(serviceResponse: ServiceResponse): RegisterResponseDto {
    return plainToClass(RegisterResponseDto, {
      message: serviceResponse.message,
      data: serviceResponse.data,
    });
  }

  static transformToCheckUserResponse(
    message: string,
    token: string = '',
    userExists: boolean = false
  ): CheckUserResponseDto {
    return plainToClass(CheckUserResponseDto, {
      message,
      token,
      userExists,
    });
  }

  static transformToResendOtpResponse(message: string): ResendOtpResponseDto {
    return plainToClass(ResendOtpResponseDto, {
      message,
    });
  }
}
