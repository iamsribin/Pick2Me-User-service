import UserRepository from '../../repositories/implementation/user-repo';
import { IRegistrationService } from '../interfaces/IRegistrationService';
import bcrypt from '../../utilities/bcrypt';
import { UserData } from "../../dto/registrationServiceDTO";
import { generateReferralCode } from '../../utilities/refferalCodeGenarate';
import { ServiceResponse } from '../../dto/serviceResponse';

export class RegistrationService implements IRegistrationService {
  constructor(
    private readonly userRepo: UserRepository
  ) {}

  async user_registration(userData: UserData): Promise<ServiceResponse> {
    try {
      const { name, email, mobile, password, reffered_Code, userImage } = userData;

      const referral_code = generateReferralCode();
      const hashedPassword = await bcrypt.securePassword(password);

      const newUserData = {
        name,
        email,
        mobile,
        password: hashedPassword,
        referral_code,
        userImage,
      };

      const response = await this.userRepo.saveUser(newUserData);

      return { 
        message: 'User registered successfully', 
        data: {
          id: response.id,
          name: response.name,
          email: response.email,
          mobile: response.mobile,
          referral_code: response.referral_code,
          joining_date: response.joining_date,
        }
      };
    } catch (error) {
      throw new Error('Failed to register user');
    }
  }

  async checkUser(mobile: string, email: string): Promise<ServiceResponse> {
    try {
      const user = await this.userRepo.checkUser(mobile, email);
      console.log("mobile, email", mobile, email);

      if (user) {
        return { message: 'User already has an account', data: user };
      }
      return { message: 'User not registered' };
    } catch (error) {
      console.log("service error", error);
      return { message: 'Internal error' };
    }
  }
}

