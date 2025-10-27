import { AuthService } from '../../utilities/auth';
import { ILoginService } from '../interfaces/i-login-service';
import { handleControllerError } from '../../utilities/handleError';
import { ServiceResponse } from '../../dto/serviceResponse';
import { LoginResponseDto } from '../../dto/response/login-response.dto';
import { LoginTransformer } from '../../dto/transformer/login-transformer.dto';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../../repositories/interface/i-user-repository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../inversify/types';

@injectable()
export class LoginService implements ILoginService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepo: IUserRepository,
    @inject(TYPES.AuthService) private readonly authService: AuthService
  ) {}

  /**
   * Handles the common login logic for both mobile and Google authentication
   * @param user - User entity
   * @returns ServiceResponse with authentication data
   */   
  private async processUserAuthentication(user: User): Promise<ServiceResponse> {
    // Check if user account is blocked
    if (user.account_status === 'Block') {
      return { 
        message: 'Blocked',
        data: null 
      };
    }

    // Determine user role
    const role = user.is_admin ? 'Admin' : 'User';

    // Generate tokens
    const [token, refreshToken] = await Promise.all([
      this.authService.createToken(user.id.toString(), '15m', role),
      this.authService.createToken(user.id.toString(), '7d', role)
    ]);

    // Validate token creation
    if (!token || !refreshToken) {
      throw new Error('Failed to generate authentication tokens');
    }

    return {
      message: 'Authentication successful',
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

  /**
   * Validates user existence and processes authentication
   * @param user - User entity or null
   * @param errorContext - Context for error handling
   * @returns LoginResponseDto
   */
  private async validateAndProcessUser(
    user: User| null, 
    errorContext: string
  ): Promise<LoginResponseDto> {
    if (!user) {
      return LoginTransformer.transformToLoginResponse({
        message: 'User not found. Please check your credentials.'
      });
    }

    const serviceResponse = await this.processUserAuthentication(user);
    return LoginTransformer.transformToLoginResponse(serviceResponse);
  }

  /**
   * Authenticates user by mobile number
   * @param mobile - User's mobile number
   * @returns LoginResponseDto
   */
  async authenticateUserByMobile(mobile: string): Promise<LoginResponseDto> {
    try {
      // Validate mobile number format
      if (!mobile || typeof mobile !== 'string' || mobile.trim().length === 0) {
        return LoginTransformer.transformToLoginResponse({
          message: 'Please provide a valid mobile number.'
        });
      }

      const user = await this.userRepo.findByMobile(mobile.trim());
      if(user?.account_status =="Block"){
      return await this.validateAndProcessUser(user, 'Blocked');
      }
      return await this.validateAndProcessUser(user, 'Mobile authentication');

    } catch (error) {
      console.error('Mobile authentication error:', error);
      throw handleControllerError(error, 'Mobile authentication failed');
    }
  }

  /**
   * Authenticates user by Google email
   * @param email - User's Google email
   * @returns LoginResponseDto
   */
  async authenticateUserByGoogle(email: string): Promise<LoginResponseDto> {
    try {
      // Validate email format
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        return LoginTransformer.transformToLoginResponse({
          message: 'Please provide a valid email address.'
        });
      }

      const user = await this.userRepo.findByEmail(email.trim().toLowerCase());
      return await this.validateAndProcessUser(user, 'Google authentication');

    } catch (error) {
      console.error('Google authentication error:', error);
      throw handleControllerError(error, 'Google authentication failed');
    }
  }
}