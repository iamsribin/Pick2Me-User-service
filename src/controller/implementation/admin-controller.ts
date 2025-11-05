import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { IAdminService } from '../../services/interfaces/i-admin-service';
import { TYPES } from '../../types/container-type';

@injectable()
export class AdminController {
  constructor(@inject(TYPES.AdminService) private readonly _adminService: IAdminService) {}

  /**
   * GET /getActiveUserData
   * Query: page, limit, search, status
   * Response: { users: [], pagination: { page, limit, total, totalPages } }
   */
  getUsersList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = '1', limit = '6', search = '', status } = req.query;

      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 6));

      const result = await this._adminService.getUserWithStatusPaginated(
        status as 'Good' | 'Block',
        pageNum,
        limitNum,
        String(search).trim()
      );

      const users = result.users || [];
      const pagination = result.pagination || {};

      res.status(200).json({ users, pagination });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /blockedUserData
   * Returns users with "Block" status (paginated, search supported)
   */
  getBlockedUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = '1', limit = '6', search = '' } = req.query;

      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 6));

      const result = await this._adminService.getUserWithStatusPaginated(
        'Block',
        pageNum,
        limitNum,
        String(search).trim()
      );

      const users = result.users || [];
      const pagination = result.pagination || {};

      res.status(200).json({ users, pagination });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /userData
   * Query: id
   * Response: { user: {...} } or 404
   */
  getUserData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.query.id || '');

      if (!id) {
        res.status(400).json({ message: 'Missing user id' });
        return;
      }

      const data = await this._adminService.getUserDetails(id);

      if (!data) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ user: data });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH /updateUserStatus
   * Query: id
   * Body: { status: "Good" | "Block", reason?: string }
   */
  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.query.id || '');
      const { status, reason } = req.body;

      if (!id) res.status(400).json({ message: 'Missing user id' });
      if (!status || (status !== 'Good' && status !== 'Block')) {
        res.status(400).json({ message: 'Invalid status. Allowed: Good | Block' });
      }

      const response = await this._adminService.updateUserStatus(id, status, reason);

      res.status(200).json({ message: 'Success', userId: id, result: response });
    } catch (err) {
      next(err);
    }
  };
}
