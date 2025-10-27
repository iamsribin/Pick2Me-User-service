import { AuthService } from '../../utilities/auth';
import { IRegistrationService } from '../interfaces/i-registration-service';
import bcrypt from '../../utilities/bcrypt';
import { generateReferralCode } from '../../utilities/refferalCodeGenarate';
import { sendOtp } from '../../utilities/otpSending';
import { handleControllerError } from '../../utilities/handleError';
import { RegistrationValidation } from '../../utilities/validations/registrationValidation';
import { RegistrationTransformer } from '../../dto/transformer/registration-transformer.dto';
import { 
  RegisterResponseDto, 
  CheckUserResponseDto, 
  ResendOtpResponseDto 
} from '../../dto/response/registration-response.dto';
import { REGISTRATION_CONSTANTS } from '../../constants/registration-constants';
import { JwtPayload } from 'jsonwebtoken';
import { RegisterUserDataDto } from '../../dto/request/registration-request.dto';
import { IUserRepository } from '../../repositories/interface/i-user-repository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../inversify/types';

interface OtpPayload extends JwtPayload {
  clientId: string;
}

@injectable()
export class RegistrationService implements IRegistrationService {
  constructor(
   @inject(TYPES.UserRepository) private readonly userRepo: IUserRepository,
   @inject(TYPES.AuthService)private readonly authService: AuthService
  ) {}

  /**
   * Validates and sanitizes user registration data
   * @param userData - User registration data
   * @returns Sanitized user data
   */
  private sanitizeUserData(userData: RegisterUserDataDto): RegisterUserDataDto {
    return {
      name: userData.name?.trim(),
      email: userData.email?.trim().toLowerCase(),
      mobile: userData.mobile?.trim(),
      password: userData.password,
      reffered_Code: userData.reffered_Code?.trim() || '',
      userImage: userData.userImage?.trim() || ''
    };
  }

  /**
   * Validates OTP against the provided token
   * @param otp - OTP provided by user
   * @param token - JWT token containing the correct OTP
   * @returns boolean indicating if OTP is valid
   */
  private async validateOtp(otp: string, token: string): Promise<boolean> {
    try {
      const jwtOtp = this.authService.verifyOtpToken(token) as OtpPayload;
      return otp === jwtOtp?.clientId;
    } catch (error) {
      console.error('OTP validation error:', error);
      return false;
    }
  }

  /**
   * Creates a new user with hashed password and referral code
   * @param userData - Sanitized user data
   * @returns Promise<RegisterResponseDto>
   */
  private async createNewUser(userData: RegisterUserDataDto): Promise<RegisterResponseDto> {
    try {
      const referral_code = generateReferralCode();
      const hashedPassword = await bcrypt.securePassword(userData.password);

      const newUserData = {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: hashedPassword,
        referral_code,
        userImage: userData.userImage,
      };

      const savedUser = await this.userRepo.create(newUserData);

      return RegistrationTransformer.transformToRegisterResponse({
        message: REGISTRATION_CONSTANTS.MESSAGES.REGISTRATION_SUCCESS,
        data: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          mobile: savedUser.mobile,
          referral_code: savedUser.referral_code,
          joining_date: savedUser.joining_date,
        }
      });
    } catch (error) {
      console.error('User creation error:', error);
      throw new Error(REGISTRATION_CONSTANTS.MESSAGES.REGISTRATION_FAILED);
    }
  }

  /**
   * Registers a new user
   * @param userData - User registration data
   * @returns Promise<RegisterResponseDto>
   */
  async registerUser(userData: RegisterUserDataDto): Promise<RegisterResponseDto> {
    try {
      // Validate input data
      const validationResult = RegistrationValidation.validateRegistrationData(userData);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      // Sanitize input data
      const sanitizedData = this.sanitizeUserData(userData);

      // Check if user already exists
      const existingUser = await this.userRepo.checkUserExists(
        sanitizedData.mobile, 
        sanitizedData.email
      );

      if (existingUser) {
        return RegistrationTransformer.transformToRegisterResponse({
          message: REGISTRATION_CONSTANTS.MESSAGES.USER_EXISTS
        });
      }

      // Create new user
      return await this.createNewUser(sanitizedData);
    } catch (error) {
      console.error('Registration error:', error);
      throw handleControllerError(error, 'User registration');
    }
  }

  /**
   * Validates user existence in the system
   * @param mobile - User's mobile number
   * @param email - User's email address
   * @returns Promise<CheckUserResponseDto>
   */
  async validateUserExistence(mobile: string, email: string): Promise<CheckUserResponseDto> {
    try {
      // Validate input
      if (!RegistrationValidation.isValidMobile(mobile)) {
        throw new Error(REGISTRATION_CONSTANTS.MESSAGES.INVALID_MOBILE);
      }

      if (!RegistrationValidation.isValidEmail(email)) {
        throw new Error(REGISTRATION_CONSTANTS.MESSAGES.INVALID_EMAIL);
      }

      // Check if user exists
      const existingUser = await this.userRepo.checkUserExists(
        mobile.trim(), 
        email.trim().toLowerCase()
      );

      if (existingUser) {
        return RegistrationTransformer.transformToCheckUserResponse(
          REGISTRATION_CONSTANTS.MESSAGES.USER_EXISTS,
          '',
          true
        );
      }

      return RegistrationTransformer.transformToCheckUserResponse(
        REGISTRATION_CONSTANTS.MESSAGES.USER_NOT_REGISTERED,
        '',
        false
      );
    } catch (error) {
      console.error('User validation error:', error);
      throw handleControllerError(error, 'User existence validation');
    }
  }

  /**
   * Generates and sends OTP to user's email
   * @param email - User's email address
   * @param name - User's name
   * @returns Promise<ResendOtpResponseDto>
   */
  async generateAndSendOtp(email: string, name: string): Promise<ResendOtpResponseDto> {
    try {
      // Validate input
      if (!RegistrationValidation.isValidEmail(email)) {
        throw new Error(REGISTRATION_CONSTANTS.MESSAGES.INVALID_EMAIL);
      }

      if (!name || name.trim().length === 0) {
        throw new Error(REGISTRATION_CONSTANTS.MESSAGES.INVALID_NAME);
      }

      // Generate and send OTP
      const token = await sendOtp(email.trim().toLowerCase(), name.trim());
      
      if (!token) {
        throw new Error(REGISTRATION_CONSTANTS.MESSAGES.OTP_GENERATION_FAILED);
      }

      return RegistrationTransformer.transformToResendOtpResponse(
        REGISTRATION_CONSTANTS.MESSAGES.OTP_SENT_SUCCESS,
        token
      );
    } catch (error) {
      console.error('OTP generation error:', error);
      throw handleControllerError(error, 'OTP generation');
    }
  }

  /**
   * Verifies OTP and registers user if valid
   * @param userData - User registration data
   * @param otp - OTP provided by user
   * @param token - JWT token containing the correct OTP
   * @returns Promise<RegisterResponseDto>
   */
  async verifyOtpAndRegister(
    userData: RegisterUserDataDto, 
    otp: string, 
    token: string
  ): Promise<RegisterResponseDto> {
    try {
      // Validate OTP
      const isValidOtp = await this.validateOtp(otp, token);
      if (!isValidOtp) {
        throw new Error(REGISTRATION_CONSTANTS.MESSAGES.INVALID_OTP);
      }

      // Register user
      return await this.registerUser(userData);
    } catch (error) {
      console.error('OTP verification and registration error:', error);
      throw handleControllerError(error, 'OTP verification and registration');
    }
  }
}