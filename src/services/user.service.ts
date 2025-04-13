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

  static async getAllUsers(): Promise<IUser[]> {
    return User.find();
  }
}
