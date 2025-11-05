import { injectable } from 'inversify';
import { User } from '../../model/user-schema';
import { IUserRepository } from '../interface/i-user-repository';
import { AppDataSource } from '../../config/sql-database';
import { SqlBaseRepository } from '@Pick2Me/shared';

@injectable()
export class UserRepository extends SqlBaseRepository<User> implements IUserRepository {
  constructor() {
    super(User, AppDataSource);
  }

  async findByMobile(mobile: string): Promise<User | null> {
    try {
      return await this.findOne({ mobile });
    } catch (error) {
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.findOne({ email });
    } catch (error) {
      return null;
    }
  }

  async checkUserExists(mobile: string, email: string): Promise<User | null> {
    try {
      return await this.repo.findOne({
        where: [{ mobile }, { email }],
      });
    } catch (error) {
      return null;
    }
  }

  async getUserWithTransactions(id: string): Promise<User | null> {
    try {
      return await this.repo.findOne({
        where: { id },
        relations: ['transactions'],
      });
    } catch (error) {
      return null;
    }
  }
}
