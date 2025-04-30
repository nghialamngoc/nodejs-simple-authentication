export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  allowedOrigins: process.env.ALLOWED_ORIGINS || "",
  fbClientId: process.env.FACEBOOK_CLIENT_ID || "",
  fbClientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
};
