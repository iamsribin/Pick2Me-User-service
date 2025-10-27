import { handleControllerError } from "../../utilities/handleError";
import { 
  SignupRequestDto, 
  CheckUserRequestDto, 
  ResendOtpRequestDto  
} from '../../dto/request/registration-request.dto';
import { 
  RegisterResponseDto, 
  CheckUserResponseDto, 
  ResendOtpResponseDto 
} from '../../dto/response/registration-response.dto';
import { ControllerCallback } from '../interfaces/i-login-controller';
import { IRegistrationController } from '../interfaces/i-register-controller';
import { IRegistrationService } from '../../services/interfaces/i-registration-service';
import { TYPES } from "../../inversify/types";
import { inject, injectable } from "inversify";

@injectable()
export class RegistrationController implements IRegistrationController {
  constructor(@inject(TYPES.RegistrationService) private readonly _registrationService: IRegistrationService) {}

  /**
   * Handles user registration with OTP verification
   * @param call - Request object containing user data, OTP, and token
   * @param callback - Callback to return the registration result or error
   */
  async signup(
    call: { request: SignupRequestDto },
    callback: ControllerCallback<RegisterResponseDto>
  ): Promise<void> {
    try {
      const { name, email, mobile, password, reffered_Code, userImage, otp, token } = call.request;

      const result = await this._registrationService.verifyOtpAndRegister(
        { name, email, mobile, password, reffered_Code, userImage },
        otp,
        token
      );

      callback(null, result);
    } catch (error) {
      callback(handleControllerError(error, 'User registration'));
    }
  }

  /**
   * Checks if user exists and sends OTP if not registered
   * @param call - Request object containing mobile, email, and name
   * @param callback - Callback to return the check result or error
   */
  async checkUser(
    call: { request: CheckUserRequestDto },
    callback: ControllerCallback<CheckUserResponseDto>
  ): Promise<void> {
    try {
      const { mobile, email, name } = call.request;
      
      const userCheckResult = await this._registrationService.validateUserExistence(mobile, email);
      
      // If user doesn't exist, generate and send OTP
      if (!userCheckResult.userExists) {
        const otpResult = await this._registrationService.generateAndSendOtp(email, name);
        callback(null, {
          message: userCheckResult.message,
          token: otpResult.token,
          userExists: false
        });
        return;
      }

      callback(null, userCheckResult);
    } catch (error) {
      callback(handleControllerError(error, 'User check'));
    }
  }

  /**
   * Resends OTP to user's email
   * @param call - Request object containing email and name
   * @param callback - Callback to return the OTP resend result or error
   */
  async resendOtp(
    call: { request: ResendOtpRequestDto },
    callback: ControllerCallback<ResendOtpResponseDto>
  ): Promise<void> {
    try {
      const { email, name } = call.request;
      
      const result = await this._registrationService.generateAndSendOtp(email, name);
      callback(null, result);
    } catch (error) {
      callback(handleControllerError(error, 'OTP resend'));
    }
  }
}