import { User } from '../../entities/user.entity';

export interface IAdminRepository {
  /**
   * Find users by status with pagination and optional search.
   * @param status - Filter by account status ("Good" or "Block")
   * @param page - Current page number (default 1)
   * @param limit - Items per page (default 6)
   * @param search - Optional search term for name or email
   */
  findUsersByStatusWithPagination(
    status: 'Good' | 'Block',
    page?: number,
    limit?: number,
    search?: string
  ): Promise<{ users: User[]; totalCount: number } | null>;

  /**
   * Find all users by status without pagination.
   * @param status - Filter by account status ("Good" or "Block")
   */
  findUsersByStatus(status: 'Good' | 'Block'): Promise<User[] | null>;

  /**
   * Get a single user's full details including relations (like transactions).
   * @param id - User ID
   */
  getUserAllDetails(id: string): Promise<User | null>;

  /**
   * Update a user's account status and reason.
   * @param id - User ID
   * @param status - New status ("Good" or "Block")
   * @param reason - Reason for status change
   */
  updateUserStatus(id: string, status: 'Good' | 'Block', reason: string): Promise<User | null>;
}
