export interface ServiceResponse {
  message: string;
  data?: any;
}

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  message: string;
  name: string;
  _id: string;
  role: boolean;
}
