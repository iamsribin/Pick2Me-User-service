import { IUserDto, IUserProfileGrpcResponse } from '../../dto/response/i-profile.dto';
import { IUpdateUserStatusGrpcResponse, UserListDTO } from '../../dto/response/admin-response.dto';
import { PaginatedUserListDTO, PaginationQuery } from '../../dto/response/pagination.dto';

export type IAdminCallback<
  T = IUpdateUserStatusGrpcResponse | UserListDTO | IUserProfileGrpcResponse,
> = (error: Error | null, response?: T) => void;

export interface IAdminController {
  getUsersList(
    call: { request: PaginationQuery },
    callback: IAdminCallback<PaginatedUserListDTO>
  ): Promise<void>;

  getBlockedUsers(
    call: { request: PaginationQuery },
    callback: IAdminCallback<PaginatedUserListDTO>
  ): Promise<void>;

  getUserDetails(
    call: { request: { id: string } },
    callback: IAdminCallback<IUserDto>
  ): Promise<void>;

  updateUserStatus(
    call: { request: { id: string; status: 'Good' | 'Block'; reason: string } },
    callback: IAdminCallback<IUpdateUserStatusGrpcResponse>
  ): Promise<void>;
}
