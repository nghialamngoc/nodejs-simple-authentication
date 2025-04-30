export interface IUser {
  _id: string;
  email: string;
  password?: string;
  name?: string;
  roles: string[];
  isActive?: boolean;
  provider?: "local" | "google" | "facebook";
  providerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserInput {
  email: string;
  password: string;
  name: string;
  roles?: string[];
}
