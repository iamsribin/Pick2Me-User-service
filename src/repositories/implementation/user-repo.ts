import { User } from '../../entities/user.entity';
import { handleControllerError } from '../../utilities/handleError';
import BaseRepository from './base-repo';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByMobile(mobile: string): Promise<User | null> {
    return await this.findOne({ mobile });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email });
  }

  async checkUserExists(mobile: string, email: string): Promise<User | null> {
    try {
      return await this.repo.findOne({
        where: [{ mobile }, { email }],
      });
    } catch (error) {
      throw handleControllerError(error, 'Check user by mobile/email');
    }
  }

  async getUserWithTransactions(id: string): Promise<User | null> {
    try {
      return await this.repo.findOne({
        where: { id },
        relations: ['transactions'],
      });
    } catch (error) {
      throw handleControllerError(error, 'Get user with transactions');
    }
  }
}
