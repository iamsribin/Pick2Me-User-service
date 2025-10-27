import { handleControllerError } from '../../utilities/handleError';
import { ILoginController, ControllerCallback } from '../interfaces/i-login-controller';
import { LoginResponseDto } from '../../dto/response/login-response.dto';
import { LoginByMobileRequestDto, LoginByGoogleRequestDto } from '../../dto/request/login-request.dto';
import { ILoginService } from '../../services/interfaces/i-login-service';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../inversify/types';

@injectable()
export class LoginController implements ILoginController {
  constructor(@inject(TYPES.LoginService) private readonly _loginService: ILoginService) {}

  /**
   * Authenticates a user using their mobile number
   * @param call - Request object containing the mobile number
   * @param callback - Callback to return the authentication result or error
   */
  async checkLoginUser(
    call: { request: LoginByMobileRequestDto },
    callback: ControllerCallback<LoginResponseDto>
  ): Promise<void> {
    try {
      const { mobile } = call.request;
      const result = await this._loginService.authenticateUserByMobile(mobile);   
         
      callback(null, result);
    } catch (error) {
      callback(handleControllerError(error, 'User authentication'));
    }
  }

  /**
   * Authenticates a user using their Google account email
   * @param call - Request object containing the email
   * @param callback - Callback to return the authentication result or error
   */
  async checkGoogleLoginUser(
    call: { request: LoginByGoogleRequestDto },
    callback: ControllerCallback<LoginResponseDto>
  ): Promise<void> {
    try {
      const { email } = call.request;
      const result = await this._loginService.authenticateUserByGoogle(email);
      callback(null, result);
    } catch (error) {
      callback(handleControllerError(error, 'Google authentication'));
    }
  }
}