import { IResponse } from '../../dto/request/user-response.dto';
import { UserProfileDto } from '../../dto/response/user-response.dto';

export interface IUserService {
  fetchUserProfile(id: string): Promise<IResponse<UserProfileDto>>;
}
