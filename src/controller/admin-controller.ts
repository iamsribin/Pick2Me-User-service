import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { IAdminService } from '@/services/interfaces/i-admin-service';
import { TYPES } from '@/types/container-type';

@injectable()
export class AdminController {
  constructor(@inject(TYPES.AdminService) private readonly _adminService: IAdminService) {}

  getUserList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Number(req.query.limit) || 6);
      const status = req.query.status;

      const search = String(req.query.search || '');

      const result = await this._adminService.getUserList(
        status as 'Good' | 'Block',
        page,
        limit,
        String(search).trim()
      );

      res.status(200).json({
        users: result.users || [],
        pagination: result.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: limit,
        },
      });
    } catch (err) {
      next(err);
    }
  };

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
