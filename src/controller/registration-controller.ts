import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { IRegistrationService } from '../services/interfaces/i-registration-service';
import { ConflictError, ForbiddenError, StatusCode } from '@Pick2Me/shared';
import { uploadToS3Public } from '../utils/s3';
import { TYPES } from '../types/container-type';

@injectable()
export class RegistrationController {
  constructor(
    @inject(TYPES.RegistrationService) private readonly _registrationService: IRegistrationService
  ) {}

  register = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { name, email, mobile, password, reffered_Code, otp } = req.body;

      const file = req.file as Express.Multer.File | undefined;

      let user_image =
        'https://retro-routes-store.s3.eu-north-1.amazonaws.com/1762197847863-Gemini_Generated_Image_dmzlyqdmzlyqdmzl.png';

      console.log('file', file);

      if (file) {
        user_image = await uploadToS3Public(file);
      }

      const payload = { name, email, mobile, password, reffered_Code, user_image };

      const result = await this._registrationService.verifyOtpAndRegister(payload, otp, email);

      res.status(201).json(result);
    } catch (error) {
      _next(error);
    }
  };

  checkUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { mobile, email, name } = req.body;

      const userCheckResult = await this._registrationService.validateUserExistence(mobile, email);

      if (userCheckResult.userExists)
        throw ConflictError('you already created a account please login!');

      const response = await this._registrationService.generateAndSendOtp(email, name);

      return res.status(StatusCode.Created).json(response);
    } catch (error) {
      _next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { email, name } = req.body;

      const result = await this._registrationService.generateAndSendOtp(email, name);

      res.status(201).json(result);
    } catch (error) {
      _next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!req.cookies) throw ForbiddenError('token missing');

      const accessToken = await this._registrationService.refreshToken(refreshToken);
      res.status(200).json(accessToken);
    } catch (err: unknown) {
      next(err);
    }
  };

  checkGoogleLoginUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await this._registrationService.authenticateUserByGoogle(email);

      const { refreshToken, token, ...responseWithoutToken } = result;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 day
      });

      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3 * 60 * 1000, //3 min
      });

      console.log('set both in cookie goole');

      res.status(200).json(responseWithoutToken);
    } catch (error) {
      _next(error);
    }
  };

  checkLoginUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { mobile } = req.body;
      const result = await this._registrationService.authenticateUserByMobile(mobile);

      const { refreshToken, token, ...responseWithoutToken } = result;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 day
      });

      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3 * 60 * 1000, //3 min
      });
      console.log('set both in cookie mobile');

      res.status(200).json(responseWithoutToken);
    } catch (error) {
      _next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('logout');

      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      res.status(StatusCode.OK).json({ message: 'successfully logged out' });
    } catch (err) {
      console.log('err', err);

      next(err);
    }
  };
}
