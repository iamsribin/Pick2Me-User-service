import { inject, injectable } from 'inversify';
import { AvatarData, UserProfileDto } from '@/dto/response/user-response.dto';
import { IUserRepository } from '@/repositories/interface/i-user-repository';
import { IUserService } from '../interfaces/i-user-service';
import { TYPES } from '@/types/container-type';
import { REGISTRATION_CONSTANTS } from '@/constants/registration-constants';
import { deleteFromS3, uploadToS3Public } from '@/utils/s3';
import { fetchUserWalletBalanceAndTransactions } from '@/grpc/client/payment-client';
import {
  BadRequestError,
  HttpError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
} from '@Pick2Me/shared/errors';
import { Coordinates, IResponse, StatusCode } from '@Pick2Me/shared/interfaces';
import { UserEventProducer } from '@/event/user.producer';
import { SavedLocation } from '@/types/place-type';

@injectable()
export class UserService implements IUserService {
  constructor(@inject(TYPES.UserRepository) private _userRepo: IUserRepository) {}

  async fetchProfile(id: string): Promise<IResponse<UserProfileDto>> {
    try {
      const user = await this._userRepo.findById(id);

      if (!user) throw UnauthorizedError('Access denied. User not found');

      const walletBalanceAndTransactions = await fetchUserWalletBalanceAndTransactions(user.id);

      const data: UserProfileDto = {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile.toString(),
        userImage: user.user_image || '',
        referralCode: user.referral_code || null,
        joiningDate: user.joining_date,
        accountStatus: user.account_status,
        wallet: {
          balance: Number(walletBalanceAndTransactions.balance),
          transactions: walletBalanceAndTransactions.transactions,
        },
        rideDetails: {
          completedRides: Number(user.completed_ride_count),
          cancelledRides: Number(user.cancel_ride_count),
        },
      };
      await UserEventProducer.addedRewardAmount('58b504b7-4359-432a-8bb0-8ca13e643f2a');

      return {
        message: 'success',
        status: StatusCode.OK,
        data,
      };
    } catch (error) {
      console.log(error);

      if (error instanceof HttpError) throw error;
      throw InternalError(REGISTRATION_CONSTANTS.MESSAGES.INTERNAL_ERROR);
    }
  }

  async updateAvatar(avatarData: AvatarData): Promise<IResponse<null>> {
    try {
      const user = await this._userRepo.findById(avatarData.id);

      if (!user) throw BadRequestError('account not fount');

      const avatarUlr = await uploadToS3Public(avatarData.file);

      await this._userRepo.update(avatarData.id, { user_image: avatarUlr });

      if (user.user_image) await deleteFromS3(user.user_image);

      return {
        status: StatusCode.Created,
        message: 'successfully updated',
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpError) throw error;
      throw InternalError('something went wrong!');
    }
  }

  async updateName(nameUpdateData: { newName: string; id: string }): Promise<IResponse<null>> {
    try {
      const user = await this._userRepo.update(nameUpdateData.id, { name: nameUpdateData.newName });

      if (!user) throw BadRequestError('account not fount');

      return {
        status: StatusCode.OK,
        message: 'successfully updated',
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpError) throw error;
      throw InternalError('something went wrong!');
    }
  }

  async saveNewPlace(
    name: string,
    address: string,
    coordinates: Coordinates,
    userId: string
  ): Promise<void> {
    try {
      const user = await this._userRepo.findById(userId);
      if (!user) throw NotFoundError('user not found');

      const existing: SavedLocation[] = Array.isArray(user.saved_locations)
        ? user.saved_locations
        : [];

      const newPlace: SavedLocation = { name, address, coordinates };

      existing.push(newPlace);

      await this._userRepo.update(userId, { saved_locations: existing });
    } catch (error) {
      console.log(error);
      
      if (error instanceof HttpError) throw error;
      throw InternalError('something went wrong');
    }
  }

  async fetchSavedPlaces(id: string): Promise<SavedLocation[]> {
    try {
      const user = await this._userRepo.findById(id);

      const places = user?.saved_locations;

      return places ? places : [];
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw InternalError('something went wrong');
    }
  }
}
