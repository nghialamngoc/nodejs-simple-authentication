export interface ILoginInput {
  email: string;
  password: string;
}

export interface ITokenPayload {
  userId: string;
  roles: string[];
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}

export interface IRefreshTokenInput {
  refreshToken: string;
}

export interface IRegisterInput {
  email: string;
  password: string;
  name?: string;
}
