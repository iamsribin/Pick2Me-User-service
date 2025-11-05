import { plainToClass } from 'class-transformer';
import { LoginResponseDto } from '../response/login-response.dto';
import { ServiceResponse } from '../serviceResponse';

export class LoginTransformer {
  static transformToLoginResponse(serviceResponse: ServiceResponse): LoginResponseDto {
    if (!serviceResponse.data) {
      return plainToClass(LoginResponseDto, {
        message: serviceResponse.message,
        name: '',
        token: '',
        refreshToken: '',
        _id: '',
        role: '',
        mobile: '',
        profile: '',
      });
    }

    return plainToClass(LoginResponseDto, {
      message: serviceResponse.message,
      name: serviceResponse.data.name || '',
      token: serviceResponse.data.token || '',
      refreshToken: serviceResponse.data.refreshToken || '',
      _id: serviceResponse.data._id || '',
      role: serviceResponse.data.role || '',
      mobile: serviceResponse.data.mobile || '',
      profile: serviceResponse.data.profile || '',
    });
  }
}
