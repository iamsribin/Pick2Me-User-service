import { IResponse } from '@Pick2Me/shared';
import { AvatarData, UserProfileDto } from '../../dto/response/user-response.dto';

export interface IUserService {
  fetchProfile(id: string): Promise<IResponse<UserProfileDto>>;
  updateAvatar(avatarData: AvatarData): Promise<IResponse<null>>;
  updateName(nameUpdateData: { newName: string; id: string }): Promise<IResponse<null>>;
}
