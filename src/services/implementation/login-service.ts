import {UserRepository} from '../../repositories/implementation/user-repo';
import { AuthService } from '../../utilities/auth';
import { ILoginService } from '../interfaces/i-login-service';
import { IUser } from '../../interface/user.interface';
import { handleControllerError } from '../../utilities/handleError';
import { ServiceResponse } from '../../dto/serviceResponse';

export class LoginService implements ILoginService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly authService: AuthService
  ) {}

  private async handleLogin(user: IUser): Promise<ServiceResponse> {
    if (user.account_status === 'Block') {
      return { message: 'Blocked' };
    }

    const role = user.is_admin ? 'Admin' : 'User';
    const token = await this.authService.createToken(user.id.toString(), '15m', role);
    const refreshToken = await this.authService.createToken(user.id.toString(), '7d', role);

    if (!token || !refreshToken) {
      throw new Error('Issue in token creation');
    }

    return {
      message: 'Success',
      data: {
        name: user.name,
        token,
        _id: user.id.toString(),
        refreshToken,
        role,
        mobile: user.mobile,
        profile: user.user_image
      },
    };
  }

  async checkLoginUser(mobile: string): Promise<ServiceResponse> {
    try {
      const user = await this.userRepo.findByMobile(mobile);

      if (!user) {
        return { message: 'No user found' };
      }

      return await this.handleLogin(user);
    } catch (error) {
      console.log("checkLoginUser err", error);
      throw handleControllerError(error, 'User authentication');
    }
  }

  async checkGoogleUser(email: string): Promise<ServiceResponse> {
    try {
      const user = await this.userRepo.findByEmail(email);

      if (!user) {
        return { message: 'No user found' };
      }

      return await this.handleLogin(user);
    } catch (error) {
      throw handleControllerError(error, 'Google authentication');
    }
  }
}