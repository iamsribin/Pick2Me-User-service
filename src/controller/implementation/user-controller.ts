import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { IUserController } from "../interfaces/i-user-controller";
import { IResponse } from "../../dto/request/user-response.dto";
import { StatusCode } from "../../dto/common";
import { IUserService } from "../../services/interfaces/i-user-service";
import { UserProfileDto } from "../../dto/response/user-response.dto";
import { inject, injectable } from "inversify";
import { TYPES } from "../../inversify/types";

@injectable()
export class UserController implements IUserController {

  constructor(@inject(TYPES.UserService) private _userService: IUserService) {}

  async fetchUserProfile(
    call: ServerUnaryCall<{ id: string }, IResponse<UserProfileDto>>,
    callback: sendUnaryData<IResponse<UserProfileDto>>
  ): Promise<void> {
    try {
      
      const { id } = call.request;
      const response = await this._userService.fetchUserProfile(id);
      console.log("response",response);
      
      callback(null, response);
    } catch (error) {
      console.log("error",error);
      
      callback(null, {
        status: StatusCode.InternalServerError,
        message: (error as Error).message,
      });
    }
  }
}
