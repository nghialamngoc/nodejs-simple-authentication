export interface ILoginInput {
  email: string;
  password: string;
}

export interface ITokenPayload {
  userId: string;
  roles: string[];
}

export interface IAuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
  requires2FA?: boolean; // Cờ yêu cầu 2FA
  qrCodeUrl?: string; // URL mã QR khi cần kích hoạt 2FA
  tempSecret?: string; // Bí mật TOTP tạm thời
  recoveryCodes?: string[]; // Mã khôi phục khi kích hoạt 2FA
}

export interface IRefreshTokenInput {
  refreshToken: string;
}

export interface IRegisterInput {
  email: string;
  password: string;
  name?: string;
}
