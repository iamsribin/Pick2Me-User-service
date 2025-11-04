import { IRegistrationService } from '../interfaces/i-registration-service';
import { generateReferralCode } from '../../utils/refferalCodeGenarate';
import { sendOtp } from '../../utils/otpSending';
import { RegistrationValidation } from '../../utils/sql-validation/registrationValidation';
import { RegistrationTransformer } from '../../dto/transformer/registration-transformer.dto';
import { 
  RegisterResponseDto, 
  CheckUserResponseDto, 
  ResendOtpResponseDto 
} from '../../dto/response/registration-response.dto';
import { REGISTRATION_CONSTANTS } from '../../constants/registration-constants';
import { RegisterUserDataDto } from '../../dto/request/registration-request.dto';
import { IUserRepository } from '../../repositories/interface/i-user-repository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../inversify/types';
import { LoginResponseDto } from '../../dto/response/login-response.dto';
import { AccessPayload, BadRequestError, ConflictError, ForbiddenError, generateJwtToken, getRedisService, HttpError, InternalError, NotFoundError, UnauthorizedError, verifyToken } from '@retro-routes/shared';
import { sanitizeService } from '../../utils/sql-validation/sanitization';
import generateOTP from '../../utils/generateOtp';

@injectable()
export class RegistrationService implements IRegistrationService {
  constructor(
   @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
  ) {}

    /**
     * Authenticates user by mobile number
     * @param mobile - User's mobile number
     * @returns LoginResponseDto
     */
    async authenticateUserByMobile(mobile: string): Promise<LoginResponseDto> {
      try {
        // Validate mobile number format
        if (!mobile || typeof mobile !== 'string' || mobile.trim().length === 0) {
            throw BadRequestError('Please provide a valid mobile number.')
        }
  
        const user = await this._userRepo.findByMobile(mobile.trim());

        if (!user) {
        throw NotFoundError("Account not found. Please create a new account.","/signup")
       }
        
        if(user?.account_status =="Block"){
        throw UnauthorizedError("Your account is blocked. Please contact support!")
        }

        // Generate tokens
      const payload:AccessPayload = { id: user.id.toString(), role:user.role };

       const refreshToken = generateJwtToken(
              payload,
              process.env.USER_SECRET_KEY as string,
              "7d"
           )

       const accessToken = generateJwtToken(
               payload,
              process.env.USER_SECRET_KEY as string,
              "3m"
             )

      // Validate token creation
      if (!accessToken || !refreshToken) {
        throw UnauthorizedError('Failed to generate authentication tokens');
      }
        return {
          _id: user.id,
          message:"Authentication successful",
          name:user.name,
          role:user.role,
          token:accessToken,
          refreshToken:refreshToken
        }
  
      } catch (error) {
        if(error instanceof HttpError) throw error
        throw InternalError("something went wrong")
        
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
           throw BadRequestError('Please provide a valid email address.')
        }
  
        const user = await this._userRepo.findByEmail(email.trim().toLowerCase());

        if(!user) throw UnauthorizedError("account not found");

        // Determine user role
      const role = user.role;
  
      // Generate tokens
      const payload:AccessPayload = { id: user.id.toString(), role: role };

       const refreshToken = generateJwtToken(
              payload,
              process.env.USER_SECRET_KEY as string,
              "7d"
           )

       const accessToken = generateJwtToken(
               payload,
              process.env.USER_SECRET_KEY as string,
              "3m"
             )

      // Validate token creation
      if (!accessToken || !refreshToken) {
        throw UnauthorizedError('Failed to generate authentication tokens');
      }
        return {
          _id: user.id,
          message:"Authentication successful",
          name:user.name,
          role:user.role,
          token:accessToken,
          refreshToken:refreshToken
        }
  
      } catch (error) {
        if(error instanceof HttpError) throw  error
        throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);;
      }
    }

  async refreshToken(token: string): Promise<{accessToken:string}> {
  try {
    if (!token) throw ForbiddenError("no token provided");
  
    const payload = verifyToken(token, process.env.JWT_REFRESH_TOKEN_SECRET as string) as AccessPayload;
  
    if (!payload) throw ForbiddenError("token missing");
  
    const user = await this._userRepo.findById(payload.id);

    if (!user) throw UnauthorizedError("account not found");
  
    if (user.account_status === "Block")
      throw UnauthorizedError("Your account has been blocked!");
  
    const accessToken = generateJwtToken(
      { id: payload.id, role: payload.role },
      process.env.JWT_ACCESS_TOKEN_SECRET as string,
      "3m"
    );
  
    return { accessToken };
  } catch (error) {
    if(error instanceof HttpError) throw  error
    throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
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
      
      if (!validationResult.isValid) throw BadRequestError(validationResult.errors.join(', '))

      // Sanitize input data
      const sanitizedData = sanitizeService.sanitizeUserData(userData);

      // Check if user already exists
      const existingUser = await this._userRepo.checkUserExists(
        sanitizedData.mobile, 
        sanitizedData.email
      );

      if (existingUser) throw ConflictError("already registered try to login")

      // Create new user
      const referral_code = generateReferralCode();

      const newUserData = {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        referral_code,
        user_image: userData.user_image,
      };

      const savedUser = await this._userRepo.create(newUserData);

      if(!savedUser)throw InternalError("Failed to create user");

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
      if(error instanceof HttpError) throw  error
      throw InternalError("something went wrong");
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
      if (!RegistrationValidation.isValidMobile(mobile)) 
        throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_MOBILE)


      if (!RegistrationValidation.isValidEmail(email)) {
        throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_EMAIL)
      }

      // Check if user exists
      const existingUser = await this._userRepo.checkUserExists(
        mobile.trim(), 
        email.trim().toLowerCase()
      );

      //return existing message true
      if (existingUser) {
        return RegistrationTransformer.transformToCheckUserResponse(
          REGISTRATION_CONSTANTS.MESSAGES.USER_EXISTS,
          '',
          true
        );
      }

      //return existing message false
      return RegistrationTransformer.transformToCheckUserResponse(
        REGISTRATION_CONSTANTS.MESSAGES.USER_NOT_REGISTERED,
        '',
        false
      );
    } catch (error) {
      if(error instanceof HttpError) throw error
      throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
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
        throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_EMAIL)
      }

      if (!name || name.trim().length === 0) {
        throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_NAME);
      }

        const otp = generateOTP();
        console.log("otp==",otp);

      //send OTP
       await sendOtp(email.trim().toLowerCase(), name.trim(),otp);

       const redisService = await getRedisService();
       redisService.set(`${email}`,otp,30)

      return RegistrationTransformer.transformToResendOtpResponse(
        REGISTRATION_CONSTANTS.MESSAGES.OTP_SENT_SUCCESS
      );

    } catch (error) {
      if(error instanceof HttpError) throw error
      throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
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
    email: string
  ): Promise<RegisterResponseDto> {
    try {
      // Validate OTP
      const redisService = getRedisService();
      const storedOtp = await redisService.get(`${email}`)
      
      console.log("storedOtp",storedOtp,otp);

        if (storedOtp !== otp) {
            throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_OTP)
        }

      // Register user
      return await this.registerUser(userData);
    } catch (error) {
      if (error instanceof HttpError) throw error
      throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
    }
  }
}