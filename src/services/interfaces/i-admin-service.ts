import { IUserProfileGrpcResponse } from '../../dto/response/i-profile.dto';
import { AdminUpdateUserStatusResponse, IUpdateUserStatusGrpcResponse, UserListDTO } from '../../dto/response/res-admin.dto';

export interface IAdminService {
  getUserWithStatus(status: 'Good' | 'Block'): Promise<UserListDTO>;
  getUserDetails(id: string): Promise<IUserProfileGrpcResponse>;
  updateUserStatus(id: string, status: 'Good' | 'Block', reason: string): Promise<IUpdateUserStatusGrpcResponse>;
}