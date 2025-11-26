import { Coordinates, IResponse } from '@Pick2Me/shared/interfaces';
import { AvatarData, UserProfileDto } from '@/dto/response/user-response.dto';
import { SavedLocation } from '@/types/place-type';

export interface IUserService {
  fetchProfile(id: string): Promise<IResponse<UserProfileDto>>;
  updateAvatar(avatarData: AvatarData): Promise<IResponse<null>>;
  updateName(nameUpdateData: { newName: string; id: string }): Promise<IResponse<null>>;
  fetchSavedPlaces(id: string): Promise<SavedLocation[]>;
  saveNewPlace(
    name: string,
    address: string,
    coordinates: Coordinates,
    userId: string
  ): Promise<void>;
}
