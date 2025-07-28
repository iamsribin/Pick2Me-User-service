import { plainToInstance } from "class-transformer";
import { handleControllerError } from "../../utilities/handleError";
import { IAdminService } from "../interfaces/i-admin-service";
import { UserDto } from "../../dto/transformer/user.dto";
import { AdminRepository } from "../../repositories/implementation/admin-repo";
import { UserProfileResponseDto } from "../../dto/transformer/user-profile.dto";
import {
  IUpdateUserStatusGrpcResponse,
  UserListDTO,
} from "../../dto/response/res-admin.dto";
import {
  IUserDto,
  IUserProfileGrpcResponse,
} from "../../dto/response/i-profile.dto";

export class AdminService implements IAdminService {
  constructor(private readonly _adminRepo: AdminRepository) {}

  async getUserWithStatus(status: "Good" | "Block"): Promise<UserListDTO> {
    try {
      const users = await this._adminRepo.findUsersByStatus(status);

      const transformedUsers: UserDto[] = plainToInstance(UserDto, users, {
        excludeExtraneousValues: true,
      });
      return { Users: transformedUsers };
    } catch (error) {
      throw handleControllerError(error, "User data retrieval");
    }
  }

  async getUserDetails(id: string): Promise<IUserProfileGrpcResponse> {
    try {
      const user = await this._adminRepo.getUserAllDetails(id);
      if (!user) throw new Error("User not found");

      const transformed = plainToInstance(UserProfileResponseDto, user, {
        excludeExtraneousValues: true,
      });

      return {
        message: "User details retrieved successfully",
        data: transformed as IUserDto,
      };
    } catch (error) {
      throw handleControllerError(error, "User details retrieval");
    }
  }

  async updateUserStatus(
    id: string,
    status: "Good" | "Block",
    reason: string
  ): Promise<IUpdateUserStatusGrpcResponse> {
    try {
      const user = await this._adminRepo.updateUserStatus(id, status, reason);

      if (!user) {
        throw new Error("User not found");
      }

      return { message: "User status updated successfully", user_id: user.id };
    } catch (error) {
      throw handleControllerError(error, "User status update");
    }
  }
}
