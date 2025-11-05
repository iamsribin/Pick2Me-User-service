import { RegisterUserDataDto } from '../../dto/request/registration-request.dto';

class SanitizeService {
  sanitizeUserData(userData: RegisterUserDataDto): RegisterUserDataDto {
    return {
      name: userData.name?.trim(),
      email: userData.email?.trim().toLowerCase(),
      mobile: userData.mobile?.trim(),
      // password: userData.password,
      reffered_Code: userData.reffered_Code?.trim() || '',
      user_image: userData.user_image?.trim() || '',
    };
  }
}

export const sanitizeService = new SanitizeService();
