import { User } from '../../entities/user.entity';
import { handleControllerError } from '../../utilities/handleError';
import BaseRepository from './base-repo';

export class AdminRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

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
