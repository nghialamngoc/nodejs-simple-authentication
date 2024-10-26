import User, { IUser } from "../models/User";

export class UserService {
  async findUser(criteria: {
    _id?: string;
    email?: string;
    refreshToken?: string;
  }): Promise<IUser | null> {
    return User.findOne({ ...criteria });
  }

  async createUser(userData: {
    email?: string;
    password?: string;
    userName?: string;
    role?: "user" | "admin";
    refreshToken?: string;
    provider?: "email" | "google";
    providerId?: string;
    isVerified?: boolean;
    avatar?: string;
    isActive?: boolean;
  }): Promise<IUser> {
    const user = new User({
      ...userData,
      role: userData.role ?? "user",
      provider: userData.provider ?? "email",
    });

    return user.save();
  }
}
