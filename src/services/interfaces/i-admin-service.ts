import { IUserDto } from '../../dto/response/i-profile.dto';
import { IUpdateUserStatusGrpcResponse, UserListDTO } from '../../dto/response/admin-response.dto';
import { PaginatedUserListDTO } from '../../dto/response/pagination.dto';

export interface IAdminService {
  getUserWithStatus(status: 'Good' | 'Block'): Promise<UserListDTO>;
  getUserDetails(id: string): Promise<IUserDto>;
  getUserWithStatusPaginated(
    status: 'Good' | 'Block',
    page: number,
    limit: number,
    search: string
  ): Promise<any>;
  updateUserStatus(
    id: string,
    status: 'Good' | 'Block',
    reason: string
  ): Promise<IUpdateUserStatusGrpcResponse>;
}
