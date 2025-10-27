import { IUserDto, IUserProfileGrpcResponse } from "../../dto/response/i-profile.dto";
import { IUpdateUserStatusGrpcResponse, UserListDTO } from "../../dto/response/admin-response.dto";
import { IAdminService } from "../../services/interfaces/i-admin-service";
import { handleControllerError } from "../../utilities/handleError";
import {
  IAdminController,
  IAdminCallback,
} from "../interfaces/i-admin-controller";
import { PaginatedUserListDTO, PaginationQuery } from "../../dto/response/pagination.dto";
import { TYPES } from "../../inversify/types";
import { inject, injectable } from "inversify";

@injectable()
export class AdminController implements IAdminController {
  
  constructor(@inject(TYPES.AdminService) private _adminService: IAdminService) {}

  /**
   * Retrieves active users
   * @param call - Empty request object
   * @param callback - Callback to return the active users or error
   */
  async getUsersList(
  call: { request: PaginationQuery },
  callback: IAdminCallback<PaginatedUserListDTO>
): Promise<void> {
  try {
    
    const { page = '1', limit = '6', search = '',status } = call.request;
    
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 6)); // Max 50 items per page
    
    const result = await this._adminService.getUserWithStatusPaginated(
      status,
      pageNum,
      limitNum,
      search.trim()
    );
    
   callback(null, {
  Users: result.users,              
  pagination: result.pagination      
});
  } catch (error) {
    callback(handleControllerError(error, "Active user retrieval"));
  }
}

/**
 * Retrieves blocked users with pagination and search
 * @param call - Request object with pagination and search parameters
 * @param callback - Callback to return the paginated blocked users or error
 */
async getBlockedUsers(
  call: { request: PaginationQuery },
  callback: IAdminCallback<PaginatedUserListDTO>
): Promise<void> {
  try {
    const { page = '1', limit = '6', search = '',status } = call.request;
    
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 6)); // Max 50 items per page
    
    const result = await this._adminService.getUserWithStatusPaginated(
      "Block",
      pageNum,
      limitNum,
      search.trim()
    );
    
    callback(null, result);
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
  callback:  IAdminCallback<IUserDto>
): Promise<void> {
  try {
    const { id } = call.request;
    const data = await this._adminService.getUserDetails(id);
    console.log("datadata",data);
    
    callback(null, data);
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
