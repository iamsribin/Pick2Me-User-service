import { IUserDto } from '../../dto/response/profile.dto';
import { AdminUserListDto } from '../../dto/response/admin-response.dto';
import { IResponse } from '@Pick2Me/shared';

export interface IAdminService {

  getUserDetails(id: string): Promise<IUserDto>;

  getUserList(status: 'Good' | 'Block', page: number, limit: number, search: string): Promise<AdminUserListDto>;

  updateUserStatus(
    id: string,
    status: 'Good' | 'Block',
    reason: string
  ): Promise<IResponse<null>>;
}
