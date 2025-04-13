export const jwtConfig = {
  accessSecret: process.env.JWT_SECRET as string,
  refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRATION as string,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION as string,
};
