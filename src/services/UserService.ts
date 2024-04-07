import { hash } from "bcrypt";
import HttpException from "../exceptions/HttpException";
import NotFoundException from "../exceptions/NotFoundException";
import User from "../models/User";
import UserType from "../types/UserType";

class UserService {
  public users = User;

  public async findAllUser(): Promise<UserType[]> {
    const users = await this.users.find();
    return users;
  }

  public async findUserById(userId: string): Promise<UserType> {
    const findUser = await this.users.findOne({ _id: userId });
    if (!findUser) throw new NotFoundException("User doesn't exist");
    return findUser;
  }

  public async createUser(userData: UserType): Promise<UserType> {
    const findUser: UserType | null = await this.users.findOne({
      email: userData.email,
    });
    if (findUser)
      throw new HttpException(
        `This email ${userData.email} already exists`,
        409
      );

    const hashedPassword = await hash(userData.password, 10);
    const createUserData = await this.users.create({
      ...userData,
      password: hashedPassword,
    });
    return createUserData.toObject();
  }

  public async updateUser(
    userId: string,
    userData: UserType
  ): Promise<UserType> {
    if (userData.email) {
      const findUser = await this.users
        .findOne({
          email: userData.email,
        })
        .select("+password");
      if (findUser && findUser._id != userId)
        throw new HttpException(
          `This email ${userData.email} already exists`,
          409
        );
    }

    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
    }
    const updateUserById = await this.users
      .findByIdAndUpdate(userId, userData, { new: true })
      .select("-password");
    if (!updateUserById) throw new HttpException("User doesn't exist", 409);
    return updateUserById;
  }

  public async deleteUser(userId: string): Promise<UserType> {
    const deleteUserById = await this.users.findByIdAndDelete(userId);
    if (!deleteUserById) throw new NotFoundException("User doesn't exist");
    return deleteUserById;
  }
}

export default UserService;
