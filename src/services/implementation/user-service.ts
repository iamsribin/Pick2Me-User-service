import { inject, injectable } from 'inversify';
import { IResponse } from '../../dto/request/user-response.dto';
import { UserProfileDto } from '../../dto/response/user-response.dto';
import { IUserRepository } from '../../repositories/interface/i-user-repository';
import { IUserService } from '../interfaces/i-user-service';
import { TYPES } from '../../types/container-type';
import { StatusCode, UnauthorizedError } from '@Pick2Me/shared';

@injectable()
export class UserService implements IUserService {
  constructor(@inject(TYPES.UserRepository) private _userRepo: IUserRepository) {}

  async fetchUserProfile(id: string): Promise<IResponse<UserProfileDto>> {
    try {
      const user = await this._userRepo.findById(id);

      if (!user) throw UnauthorizedError('Access denied. User not found');

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
          balance: user.wallet_balance,
          transactions: user.transactions?.length || 0,
        },
        rideDetails: {
          completedRides: Number(user.completed_ride_count),
          cancelledRides: Number(user.cancel_ride_count),
        },
      };

      return {
        message: 'success',
        status: StatusCode.OK,
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        message: 'something went wrong',
        status: StatusCode.InternalServerError,
        data: null,
      };
    }
  }
}
