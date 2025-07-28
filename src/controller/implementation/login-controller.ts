import {LoginService} from '../../services/implementation/login-service';
import { handleControllerError } from '../../utilities/handleError';
import { ILoginController, ControllerCallback, CheckLoginUserResponse, CheckGoogleLoginUserResponse } from '../interfaces/i-login-controller';

export class LoginController implements ILoginController {
  constructor(
    private readonly loginService: LoginService
  ) {}

  /**
   * Authenticates a user using their mobile number
   * @param call - Request object containing the mobile number
   * @param callback - Callback to return the authentication result or error
   */
  async checkLoginUser(
    call: { request: { mobile: string } },
    callback: ControllerCallback<CheckLoginUserResponse>
  ): Promise<void> {
    try {
      
      const { mobile } = call.request;
      const response = await this.loginService.checkLoginUser(mobile);
      
      const result: CheckLoginUserResponse = {
        message: response.message,
        name: response.data?.name || '',
        token: response.data?.token || '',
        refreshToken: response.data?.refreshToken || '',
        _id: response.data?._id || '',
        role: response.data?.role || '',
        mobile: response.data?.mobile
      };
      
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
    call: { request: { email: string } },
    callback: ControllerCallback<CheckGoogleLoginUserResponse>
  ): Promise<void> {
    try {
      const { email } = call.request;
      const response = await this.loginService.checkGoogleUser(email);
      
      const result: CheckGoogleLoginUserResponse = {
        message: response.message,
        name: response.data?.name || '',
        token: response.data?.token || '',
        refreshToken: response.data?.refreshToken || '',
        _id: response.data?._id || '',
        role: response.data?.role || ''
      };
      
      callback(null, result);
    } catch (error) {
      callback(handleControllerError(error, 'Google authentication'));
    }
  }
}