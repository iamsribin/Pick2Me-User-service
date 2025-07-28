import { IUserProfileGrpcResponse } from "../../dto/response/i-profile.dto";
import { IUpdateUserStatusGrpcResponse, UserListDTO } from "../../dto/response/res-admin.dto";
import { IAdminService } from "../../services/interfaces/i-admin-service";
import { handleControllerError } from "../../utilities/handleError";
import {
  IAdminController,
  IAdminCallback,
} from "../interfaces/i-admin-controller";

export class AdminController implements IAdminController {
  constructor(private readonly _adminService: IAdminService) {}

  /**
   * Retrieves active users
   * @param call - Empty request object
   * @param callback - Callback to return the active users or error
   */
  async getActiveUser(
    call: { request: {} },
    callback: IAdminCallback<UserListDTO>
  ): Promise<void> {
    try {
      const { Users } = await this._adminService.getUserWithStatus("Good");
      callback(null, { Users });
    } catch (error) {
      callback(handleControllerError(error, "Active user retrieval"));
    }
  }

  /**
   * Retrieves blocked users
   * @param call - Empty request object
   * @param callback - Callback to return the blocked users or error
   */
  async getBlockedUsers(
    call: { request: {} },
    callback: IAdminCallback<UserListDTO>
  ): Promise<void> {
    try {
      const { Users } = await this._adminService.getUserWithStatus("Block");
      callback(null, { Users });
    } catch (error) {
      callback(handleControllerError(error, "Blocked user retrieval"));
    }
  }

  /**
   * Retrieves details for a specific user
   * @param call - Request object containing the user ID
   * @param callback - Callback to return the user details or error
   */
async getUserDetails(
  call: { request: { id: string } },
  callback:  IAdminCallback<IUserProfileGrpcResponse>
): Promise<void> {
  try {
    const { id } = call.request;
    const response = await this._adminService.getUserDetails(id);
    callback(null, response);
  } catch (error) {
    callback(handleControllerError(error, "User details retrieval"));
  }
}

  /**
   * Updates the status of a user
   * @param call - Request object containing the user ID, status, and reason
   * @param callback - Callback to return the update result or error
   */
  async updateUserStatus(
    call: { request: { id: string; status: "Good" | "Block"; reason: string } },
    callback: IAdminCallback<IUpdateUserStatusGrpcResponse>
  ): Promise<void> {
    try {
      const { id, status, reason } = call.request;
      const response = await this._adminService.updateUserStatus(
        id,
        status,
        reason
      );
      callback(null, response);
    } catch (error) {
      callback(handleControllerError(error, "User status update"));
    }
  }
}
