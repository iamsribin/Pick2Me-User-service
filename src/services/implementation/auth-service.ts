import { IRegistrationService } from '../interfaces/i-auth-service';
import { generateReferralCode } from '@/utils/referralCodeGenerator';
import { sendOtp } from '@/utils/otpSending';
import { RegistrationValidation } from '@/utils/sql-validation/registrationValidation';
import { RegistrationTransformer } from '@/dto/transformer/registration-transformer.dto';
import { REGISTRATION_CONSTANTS } from '@/constants/registration-constants';
import { RegisterUserDataDto } from '@/dto/request/registration-request.dto';
import { IUserRepository } from '@/repositories/interface/i-user-repository';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types/container-type';
import { LoginResponseDto } from '@/dto/response/login-response.dto';
import { sanitizeService } from '@/utils/sql-validation/sanitization';
import generateOTP from '@/utils/generateOtp';
import { UserEventProducer } from '@/event/user.producer';
import {
  RegisterResponseDto,
  CheckUserResponseDto,
  ResendOtpResponseDto,
} from '@/dto/response/registration-response.dto';
import {
  BadRequestError,
  ConflictError,
  HttpError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
} from '@pick2me/shared/errors';
import { generateJwtToken, AccessPayload } from '@pick2me/shared/auth';
import { UserRegisteredEvent } from '@pick2me/shared/interfaces';
import { getRedisService } from '@pick2me/shared/redis';

@injectable()
export class RegistrationService implements IRegistrationService {
  constructor(@inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository) {}

  async authenticateUserByMobile(mobile: string): Promise<LoginResponseDto> {
    try {
      if (!mobile || typeof mobile !== 'string' || mobile.trim().length === 0) {
        throw BadRequestError('Please provide a valid mobile number.');
      }

      const user = await this._userRepo.findByMobile(mobile.trim());

      if (!user) {
        throw NotFoundError('Account not found. Please create a new account.');
      }

      if (user?.account_status == 'Block') {
        throw UnauthorizedError('Your account is blocked. Please contact support!');
      }

      const payload: AccessPayload = { id: user.id.toString(), role: user.role };

      const refreshToken = generateJwtToken(
        payload,
        process.env.REFRESH_TOKEN_SECRET as string,
        '7d'
      );

      const accessToken = generateJwtToken(
        payload,
        process.env.ACCESS_TOKEN_SECRET as string,
        '3m'
      );

      if (!accessToken || !refreshToken) {
        throw UnauthorizedError('Failed to generate authentication tokens');
      }

      return {
        _id: user.id,
        message: 'Authentication successful',
        name: user.name,
        role: user.role,
        token: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpError) throw error;
      throw InternalError('something went wrong');
    }
  }

  async authenticateUserByGoogle(email: string): Promise<LoginResponseDto> {
    try {
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        throw BadRequestError('Please provide a valid email address.');
      }

      const user = await this._userRepo.findByEmail(email.trim().toLowerCase());

      if (!user) throw UnauthorizedError('account not found');

      const role = user.role;
      console.log({ id: user.id.toString(), role: role });

      const payload: AccessPayload = { id: user.id.toString(), role: role };

      const refreshToken = generateJwtToken(
        payload,
        process.env.REFRESH_TOKEN_SECRET as string,
        '7d'
      );

      const accessToken = generateJwtToken(
        payload,
        process.env.ACCESS_TOKEN_SECRET as string,
        '3m'
      );

      if (!accessToken || !refreshToken) {
        throw UnauthorizedError('Failed to generate authentication tokens');
      }
      return {
        _id: user.id,
        message: 'Authentication successful',
        name: user.name,
        role: user.role,
        token: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
    }
  }

  async registerUser(userData: RegisterUserDataDto): Promise<RegisterResponseDto> {
    try {
      const validationResult = RegistrationValidation.validateRegistrationData(userData);

      if (!validationResult.isValid) throw BadRequestError(validationResult.errors.join(', '));

      const sanitizedData = sanitizeService.sanitizeUserData(userData);

      const existingUser = await this._userRepo.checkUserExists(
        sanitizedData.mobile,
        sanitizedData.email
      );

      if (existingUser) throw ConflictError('already registered try to login');

      const referral_code = generateReferralCode();

      const newUserData = {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        referral_code,
        user_image: userData.user_image,
        joining_date: new Date(),
      };

      const savedUser = await this._userRepo.create(newUserData);

      const event: UserRegisteredEvent = {
        userId: savedUser?.id.toString() as string,
        email: savedUser?.email.toString() as string,
        createdAt: new Date().toISOString(),
      };

      // Publish event to Payment Service
      await UserEventProducer.publishUserCreatedEvent(event);

      if (userData.reffered_Code) {
        const referredUser = await this._userRepo.findByReferralCode(userData.reffered_Code);
        if (referredUser) {
          console.log('Referred user found:', referredUser.id);
          await UserEventProducer.addedRewardAmount(referredUser.id);
        }
      }

      if (!savedUser) throw InternalError('Failed to create user');

      return RegistrationTransformer.transformToRegisterResponse({
        message: REGISTRATION_CONSTANTS.MESSAGES.REGISTRATION_SUCCESS,
        data: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          mobile: savedUser.mobile,
          referral_code: savedUser.referral_code,
          joining_date: savedUser.joining_date,
        },
      });
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw InternalError('something went wrong');
    }
  }

  async validateUserExistence(mobile: string, email: string): Promise<CheckUserResponseDto> {
    try {
      if (!RegistrationValidation.isValidMobile(mobile))
        throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_MOBILE);

      if (!RegistrationValidation.isValidEmail(email)) {
        throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_EMAIL);
      }

      const existingUser = await this._userRepo.checkUserExists(
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
      if (error instanceof HttpError) throw error;
      throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
    }
  }

  async generateAndSendOtp(email: string, name: string): Promise<ResendOtpResponseDto> {
    try {
      if (!RegistrationValidation.isValidEmail(email)) {
        throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_EMAIL);
      }

      if (!name || name.trim().length === 0) {
        throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_NAME);
      }

      const otp = generateOTP();
      console.log('otp==', otp);

      await sendOtp(email.trim().toLowerCase(), name.trim(), otp);

      const redisService = await getRedisService();
      redisService.set(`${email}`, otp, 30);

      return RegistrationTransformer.transformToResendOtpResponse(
        REGISTRATION_CONSTANTS.MESSAGES.OTP_SENT_SUCCESS
      );
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
    }
  }

  async verifyOtpAndRegister(
    userData: RegisterUserDataDto,
    otp: string,
    email: string
  ): Promise<RegisterResponseDto> {
    try {
      const redisService = getRedisService();
      const storedOtp = await redisService.get(`${email}`);

      console.log('storedOtp', storedOtp, otp);

      if (storedOtp !== otp) {
        throw BadRequestError(REGISTRATION_CONSTANTS.MESSAGES.INVALID_OTP);
      }

      return await this.registerUser(userData);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpError) throw error;
      throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
    }
  }

  // async refreshToken(token: string): Promise<{ accessToken: string }> {
  //   try {
  //     if (!token) throw ForbiddenError('no token provided');

  //     const payload = verifyToken(token, process.env.TOKEN_SECRET! as string) as AccessPayload;

  //     if (!payload) throw ForbiddenError('token missing');

  //     const user = await this._userRepo.findById(payload.id);

  //     if (!user) throw UnauthorizedError('account not found');

  //     if (user.account_status === 'Block')
  //       throw UnauthorizedError('Your account has been blocked!');

  //     const accessToken = generateJwtToken(
  //       { id: payload.id, role: payload.role },
  //       process.env.TOKEN_SECRET! as string,
  //       '3m'
  //     );
  //     console.log('accessToken', accessToken);

  //     return { accessToken };
  //   } catch (error) {
  //     console.log(error);

  //     if (error instanceof HttpError) throw error;
  //     throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
  //   }
  // }
}
