import { instanceToPlain, plainToInstance } from 'class-transformer';
import { IAdminService } from '../interfaces/i-admin-service';
import { UserDto } from '../../dto/transformer/user.dto';
import { UserProfileResponseDto } from '../../dto/transformer/user-profile.dto';
import { IUpdateUserStatusGrpcResponse, UserListDTO } from '../../dto/response/admin-response.dto';
import { IUserDto } from '../../dto/response/i-profile.dto';
import { IAdminRepository } from '../../repositories/interface/i-admin-repository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types/container-type';
import { BadRequestError } from '@Pick2Me/shared';

@injectable()
export class AdminService implements IAdminService {
  constructor(@inject(TYPES.AdminRepository) private readonly _adminRepo: IAdminRepository) {}

  async getUserWithStatusPaginated(
    status: 'Good' | 'Block',
    page: number = 1,
    limit: number = 6,
    search: string = ''
  ): Promise<any> {
    try {
      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.min(50, Math.max(1, limit));
      const trimmedSearch = search.trim();

      const users = await this._adminRepo.findUsersByStatusWithPagination(
        status,
        validatedPage,
        validatedLimit,
        trimmedSearch
      );

      if (!Array.isArray(users)) throw BadRequestError();

      const transformedUsers: UserDto[] = plainToInstance(UserDto, users, {
        excludeExtraneousValues: true,
      });

      const pagination = {
        currentPage: validatedPage,
        totalPages: Math.ceil(users.totalCount / validatedLimit),
        totalItems: users.totalCount,
        itemsPerPage: validatedLimit,
        hasNextPage: validatedPage < Math.ceil(users.totalCount / validatedLimit),
        hasPreviousPage: validatedPage > 1,
      };

      return instanceToPlain({
        users: transformedUsers,
        pagination,
      });
    } catch (error) {
      throw new Error('Paginated user data retrieval');
    }
  }

  async getUserWithStatus(status: 'Good' | 'Block'): Promise<UserListDTO> {
    try {
      const users = await this._adminRepo.findUsersByStatus(status);
      if (!Array.isArray(users)) throw BadRequestError();
      const transformedUsers: UserDto[] = plainToInstance(UserDto, users, {
        excludeExtraneousValues: true,
      });

      return { Users: transformedUsers };
    } catch (error) {
      throw new Error('User data retrieval');
    }
  }
  async getUserDetails(id: string): Promise<IUserDto> {
    try {
      const user = await this._adminRepo.getUserAllDetails(id);
      if (!user) throw new Error('User not found');

      const transformed = plainToInstance(UserProfileResponseDto, user, {
        excludeExtraneousValues: true,
      });

      return transformed;
    } catch (error) {
      throw new Error('User details retrieval');
    }
  }

  async updateUserStatus(
    id: string,
    status: 'Good' | 'Block',
    reason: string
  ): Promise<IUpdateUserStatusGrpcResponse> {
    try {
      const user = await this._adminRepo.updateUserStatus(id, status, reason);

      if (!user) {
        throw new Error('User not found');
      }

      return { message: 'User status updated successfully', user_id: user.id };
    } catch (error) {
      throw new Error('User status update');
    }
  }
}
