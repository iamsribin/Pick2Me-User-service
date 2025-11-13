import { IUser } from '@/entities/user.interface';
import { ISqlBaseRepository } from '@Pick2Me/shared';

export interface IAdminRepository extends ISqlBaseRepository<IUser> {
  findUsersByStatusWithPagination(
    status: 'Good' | 'Block',
    page?: number,
    limit?: number,
    search?: string
  ): Promise<{ users: IUser[]; totalCount: number } | null>;

  findUsersByStatus(status: 'Good' | 'Block'): Promise<IUser[] | null>;

  getUserAllDetails(id: string): Promise<IUser | null>;

  updateUserStatus(id: string, status: 'Good' | 'Block', reason: string): Promise<IUser | null>;
}
