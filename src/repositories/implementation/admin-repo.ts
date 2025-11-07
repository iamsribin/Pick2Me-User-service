import { injectable } from 'inversify';
import { IAdminRepository } from '../interface/i-admin-repository';
import { ILike } from 'typeorm';
import { AppDataSource } from '../../config/sql-database';
import { SqlBaseRepository } from '@Pick2Me/shared';
import { User } from '../../model/user-schema';
import { FilterQuery } from 'mongoose';
import { IUser } from '../../entities/user.interface';

@injectable()
export class AdminRepository extends SqlBaseRepository<User> implements IAdminRepository {
  constructor() {
    super(User, AppDataSource);
  }

  async findUsersByStatusWithPagination(
    status: 'Good' | 'Block',
    page: number = 1,
    limit: number = 6,
    search: string = ''
  ): Promise<{ users: User[]; totalCount: number } | null> {
    try {
      const offset = (page - 1) * limit;

      const baseWhere: FilterQuery<IUser> = {
        account_status: status,
        role: 'User',
      };

      if (search) {
        const searchConditions = [
          { ...baseWhere, name: ILike(`%${search}%`) },
          { ...baseWhere, email: ILike(`%${search}%`) },
        ];

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
              'cancel_ride_count',
              'completed_ride_count',
            ],
            order: {
              joining_date: 'DESC',
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
              'cancel_ride_count',
              'completed_ride_count',
            ],
            order: {
              joining_date: 'DESC',
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
    } catch {
      return null;
    }
  }

  async findUsersByStatus(status: 'Good' | 'Block'): Promise<User[] | null> {
    try {
      return await this.repo.find({
        where: {
          account_status: status,
          role: 'Admin',
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
          'cancel_ride_count',
          'completed_ride_count',
        ],
        order: {
          joining_date: 'DESC',
        },
      });
    } catch {
      return null;
    }
  }

  async getUserAllDetails(id: string): Promise<User | null> {
    try {
      return await this.repo.findOne({
        where: { id },
        relations: ['transactions'],
      });
    } catch {
      return null;
    }
  }

  async updateUserStatus(
    id: string,
    status: 'Good' | 'Block',
    reason: string
  ): Promise<User | null> {
    try {
      await this.repo.update(id, { account_status: status, reason });
      return await this.repo.findOne({ where: { id } });
    } catch {
      return null;
    }
  }
}
