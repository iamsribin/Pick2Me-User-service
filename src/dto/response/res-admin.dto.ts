import { UserDto } from "../transformer/user.dto";

export interface AdminUpdateUserStatusResponse {
  message: string;
  user_id: string;
}

export class UserListDTO {
  Users: UserDto[]=[];
}

export interface IUpdateUserStatusGrpcResponse {
  message: string;
  user_id: string;
}