export interface LoginBody {
  login: string;
  password: string;
}

export interface LoginResponse {
  Token: string;
  RefreshToken: string;
}
