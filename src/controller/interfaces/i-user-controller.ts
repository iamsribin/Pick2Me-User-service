import { NextFunction, Request, Response } from 'express';

export interface IUserController {
  fetchUserProfile(req: Request, res: Response, _next: NextFunction): Promise<void>;
}
