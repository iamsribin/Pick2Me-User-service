import { injectable } from 'inversify';
import { User } from '../../entities/user.entity';
import { handleControllerError } from '../../utilities/handleError';
import { IAdminRepository } from '../interface/i-admin-repository';
import {BaseRepository} from './base-repo';
import { Like, ILike } from 'typeorm'; 
@injectable()
export class AdminRepository extends BaseRepository<User> implements IAdminRepository  {
  constructor() {
    super(User);
  }

  // New method with pagination and search
  async findUsersByStatusWithPagination(
    status: 'Good' | 'Block',
    page: number = 1,
    limit: number = 6,
    search: string = ''
  ): Promise<{ users: User[]; totalCount: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Base query conditions
      const baseWhere: any = {
        account_status: status,
        is_admin: false,
      };

      // Add search conditions if search term is provided
      if (search) {
        // Search in name and email fields (case-insensitive)
        const searchConditions = [
          { ...baseWhere, name: ILike(`%${search}%`) },
          { ...baseWhere, email: ILike(`%${search}%`) },
        ];

        // Execute queries with search conditions
        const [users, totalCount] = await Promise.all([
          this.repo.find({
            where: searchConditions,
            select: [
              'id',
              'name',
              'email',
              'mobile',
              'user_image',
              'referral_code',
              'account_status',
              'joining_date',
              'wallet_balance',
              'cancel_ride_count',
              'completed_ride_count',
            ],
            order: {
              joining_date: 'DESC', // Most recent first
            },
            skip: offset,
            take: limit,
          }),
          this.repo.count({
            where: searchConditions,
          }),
        ]);

        return { users, totalCount };
      } else {
        // Execute queries without search conditions
        const [users, totalCount] = await Promise.all([
          this.repo.find({
            where: baseWhere,
            select: [
              'id',
              'name',
              'email',
              'mobile',
              'user_image',
              'referral_code',
              'account_status',
              'joining_date',
              'wallet_balance',
              'cancel_ride_count',
              'completed_ride_count',
            ],
            order: {
              joining_date: 'DESC', // Most recent first
            },
            skip: offset,
            take: limit,
          }),
          this.repo.count({
            where: baseWhere,
          }),
        ]);

        return { users, totalCount };
      }
    } catch (error) {
      throw handleControllerError(error, 'Find users by status with pagination');
    }
  }

  // Keep the original method for backward compatibility
  async findUsersByStatus(status: 'Good' | 'Block'): Promise<User[]> {
    try {
      return await this.repo.find({
        where: {
          account_status: status,
          is_admin: false,
        },
        select: [
          'id',
          'name',
          'email',
          'mobile',
          'user_image',
          'referral_code',
          'account_status',
          'joining_date',
          'wallet_balance',
          'cancel_ride_count',
          'completed_ride_count',
        ],
        order: {
          joining_date: 'DESC',
        },
      });
    } catch (error) {
      throw handleControllerError(error, 'Find users by status');
    }
  }

  async getUserAllDetails(id: string): Promise<User | null> {
    try {
      return await this.repo.findOne({
        where: { id },
        relations: ['transactions'],
      });
    } catch (error) {
      throw handleControllerError(error, 'Get user with transactions');
    }
  }

  async updateUserStatus(id: string, status: 'Good' | 'Block', reason: string): Promise<User | null> {
    try {
      await this.repo.update(id, { account_status: status, reason });
      return await this.repo.findOne({ where: { id } });
    } catch (error) {
      throw handleControllerError(error, 'Update user status');
    }
  }
}