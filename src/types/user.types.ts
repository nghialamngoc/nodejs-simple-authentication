export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  email: string;
  password: string;
  name: string;
  roles?: string[];
}
