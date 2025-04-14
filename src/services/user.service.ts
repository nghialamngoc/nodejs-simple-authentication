import { User } from "../models/user.model";
import { IUserInput, IUser } from "../types";

export class UserService {
  static async createUser(userInput: IUserInput) {
    // Set default role if none provided
    if (!userInput.roles || userInput.roles.length === 0) {
      userInput.roles = ["user"];
    }

    const user = await User.create(userInput);
    return user;
  }

  static async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  static async updateUser(
    id: string,
    updateData: Partial<IUserInput>
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  static async getAllUsers({
    page = 1,
    limit = 10,
  }): Promise<{ users: IUser[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit);

    const total = await User.countDocuments();

    const userList: IUser[] = users.map((user) => {
      const { _id, name, email, roles, isActive, createdAt, updatedAt } = user;
      return {
        _id: _id.toString(),
        name,
        email,
        roles,
        isActive,
        createdAt,
        updatedAt,
      };
    });

    return {
      users: userList,
      total,
      page,
      limit,
    };
  }
}
