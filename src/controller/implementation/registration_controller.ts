import { IRegistrationController, ControllerCallback, RegisterResponse, CheckUserResponse, ResendOtpResponse } from '../interfaces/IRegisterController';
import {RegistrationService} from '../../services/implementation/registration_service';
import { AuthService } from '../../utilities/auth';
import { sendOtp } from '../../utilities/otpSending';
import { JwtPayload } from 'jsonwebtoken';
import { UserData } from "../../dto/registrationServiceDTO";
import { validateInput } from '../../utilities/validations/registrationValidation';
import { handleControllerError } from "../../utilities/handleError";

interface OtpPayload extends JwtPayload {
  clientId: string;
}

export class RegistrationController implements IRegistrationController {
  constructor(
    private readonly authService: AuthService,
    private readonly RegistrationService: RegistrationService
  ) {}

  /**
   * Handles user registration with OTP verification
   * @param call - Request object containing user data, OTP, and token
   * @param callback - Callback to return the registration result or error
   */
  async signup(
    call: { request: UserData & { otp: string; token: string } },
    callback: ControllerCallback<RegisterResponse>
  ): Promise<void> {
    try {
      const { name, email, mobile, password, reffered_Code, otp, userImage, token } = call.request;

      const jwtOtp = this.authService.verifyOtpToken(token) as OtpPayload;

      if (otp !== jwtOtp?.clientId) {
        callback(new Error('Invalid OTP'));
        return;
      }

      const response = await this.RegistrationService.user_registration({
        name,
        email,
        mobile,
        password,
        reffered_Code,
        userImage,
      });

      callback(null, { message: response.message });
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
    call: { request: { mobile: string; email: string; name: string } },
    callback: ControllerCallback<CheckUserResponse>
  ): Promise<void> {
    try {
      console.log("ethi...");
      
      const { mobile, email, name } = call.request;
      // validateInput({ mobile, email, name });

      const response = await this.RegistrationService.checkUser(mobile, email);

      if (response.message === 'User not registered') {
        const token = await sendOtp(email, name);
        if (!token) {
          callback(new Error('Failed to generate OTP token'));
          return;
        }
        callback(null, { message: response.message, token });
        return;
      }

      callback(null, { message: response.message, token: '' });
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
    call: { request: { email: string; name: string } },
    callback: ControllerCallback<ResendOtpResponse>
  ): Promise<void> {
    try {
      const { email, name } = call.request;      
      validateInput({ email, name });

      const token = await sendOtp(email, name);
      if (!token) {
        callback(new Error('Failed to generate OTP token'));
        return;
      }

      callback(null, { message: 'OTP resent successfully', token });
    } catch (error:unknown) {
      callback(handleControllerError(error, 'OTP resend'));
    }
  }
}