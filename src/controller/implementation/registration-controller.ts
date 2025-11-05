import { Request, Response, NextFunction, response } from 'express';
import { inject, injectable } from 'inversify';
import { IRegistrationService } from '../../services/interfaces/i-registration-service';
import { ConflictError, ForbiddenError, StatusCode } from '@Pick2Me/shared';
import { uploadToS3Public } from '../../utils/s3';
import { TYPES } from '../../types/container-type';

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

  /**
   * POST /api/user/resendOtp
   */
  resendOtp = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { email, name } = req.body;

      const result = await this._registrationService.generateAndSendOtp(email, name);

      res.status(201).json(result);
    } catch (error) {
      _next(error);
    }
  };

  /**
   * POST /api/user/checkLoginUser
   * Body: { mobile }
   */
  checkLoginUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { mobile } = req.body;
      const result = await this._registrationService.authenticateUserByMobile(mobile);

      const { refreshToken, ...responseWithoutToken } = result;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(responseWithoutToken);
    } catch (error) {
      _next(error);
    }
  };
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!req.cookies) throw ForbiddenError('token missing');

      const accessToken = await this._registrationService.refreshToken(refreshToken);
      res.status(200).json({ accessToken });
    } catch (err: unknown) {
      next(err);
    }
  };
  /**
   * POST /api/user/checkGoogleLoginUser
   * Body: { email }
   */
  checkGoogleLoginUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await this._registrationService.authenticateUserByGoogle(email);

      const { refreshToken, ...responseWithoutToken } = result;
      console.log({ refreshToken, ...responseWithoutToken });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(responseWithoutToken);
    } catch (error) {
      console.log('err', error);

      _next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('logout');

      res.clearCookie('refreshToken');
      res.status(StatusCode.OK).json({ message: 'successfully logged out' });
    } catch (err) {
      console.log('err', err);

      next(err);
    }
  };
}
