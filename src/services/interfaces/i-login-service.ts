
export interface ServiceResponse {
  message: string;
  data?: any;
}

export interface ILoginService {
  checkLoginUser(mobile: string): Promise<ServiceResponse>;
  checkGoogleUser(email: string): Promise<ServiceResponse>;
}