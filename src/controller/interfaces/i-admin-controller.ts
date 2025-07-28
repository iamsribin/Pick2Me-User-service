import { IUserProfileGrpcResponse } from "../../dto/response/i-profile.dto";
import {IUpdateUserStatusGrpcResponse, UserListDTO } from "../../dto/response/res-admin.dto";

export type IAdminCallback<
  T = IUpdateUserStatusGrpcResponse | UserListDTO | IUserProfileGrpcResponse
> = (error: Error | null, response?: T) => void;

export interface IAdminController {
  getActiveUser(
    call: { request: {} },
    callback: IAdminCallback<UserListDTO>
  ): Promise<void>;

  getBlockedUsers(
    call: { request: {} },
    callback: IAdminCallback<UserListDTO>
  ): Promise<void>;

  getUserDetails(
    call: { request: { id: string } },
    callback: IAdminCallback<IUserProfileGrpcResponse>
  ): Promise<void>;

  updateUserStatus(
    call: { request: { id: string; status: "Good" | "Block"; reason: string } },
    callback: IAdminCallback<IUpdateUserStatusGrpcResponse>
  ): Promise<void>;
}
