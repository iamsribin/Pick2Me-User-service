import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { IUserService } from '../services/interfaces/i-user-service';
import { TYPES } from '../types/container-type';
import { uploadToS3Public } from '../utils/s3';
import { BadRequestError, UnauthorizedError } from '@Pick2Me/shared';

@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private readonly _userService: IUserService) {}

  uploadChatFile = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (!files || !files['file'] || !files['file'].length) {
        return res.status(400).json({ message: 'No file provided' });
      }

      const file = files['file'][0];
      const url = await uploadToS3Public(file);
      return res.status(202).json({ message: 'success', fileUrl: url });
    } catch (error) {
      _next(error);
    }
  };

  fetchProfile = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache');

      const user = req.gatewayUser!;
      console.log(user);

      if (!user) throw UnauthorizedError('Missing authentication token');

      const result = await this._userService.fetchProfile(user.id);
      console.log(result);

      return res.status(+result.status).json(result.data);
    } catch (error) {
      _next(error);
    }
  };

  updateAvatar = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const user = req.gatewayUser!;

      const file = req.file as Express.Multer.File;

      if (!file) throw BadRequestError('image is missing');

      const avatar = {
        id: user.id,
        file,
      };

      const response = await this._userService.updateAvatar(avatar);
      res.status(+response.status).json(response.data);
    } catch (error) {
      _next(error);
    }
  };

  updateName = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const user = req.gatewayUser!;

      const { tempName } = req.body;

      if (!tempName) throw BadRequestError('name field is missing');

      const newName = {
        id: user.id,
        newName: tempName,
      };

      const response = await this._userService.updateName(newName);
      res.status(+response.status).json(response.data);
    } catch (error) {
      _next(error);
    }
  };
}
