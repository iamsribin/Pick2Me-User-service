import { IUserDto } from '../../dto/response/profile.dto';
import { IUpdateUserStatusGrpcResponse, UserListDTO } from '../../dto/response/admin-response.dto';

export interface IAdminService {
  getUserWithStatus(status: 'Good' | 'Block'): Promise<UserListDTO>;

  getUserDetails(id: string): Promise<IUserDto>;

  getUserList(status: 'Good' | 'Block', page: number, limit: number, search: string): Promise<any>;

  updateUserStatus(
    id: string,
    status: 'Good' | 'Block',
    reason: string
  ): Promise<IUpdateUserStatusGrpcResponse>;
}
