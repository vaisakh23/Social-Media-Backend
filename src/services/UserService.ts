import { hash } from "bcrypt";
import HttpException from "../exceptions/HttpException";
import NotFoundException from "../exceptions/NotFoundException";
import User from "../models/User";
import UserType from "../types/UserType";
import { UserRoles } from "../utils/UserRoles";
import PermissionExcepton from "../exceptions/PermissionExcepton";

class UserService {
  public users = User;

  public async findAllUser(): Promise<UserType[]> {
    const users = await this.users.find();
    return users;
  }

  public async findUserById(userId: string) {
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
    authUser: UserType,
    userId: string,
    userData: any
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
    let foundUser = await this.findUserById(userId);
    this.ownerOrAdminOnly(authUser, foundUser);
    Object.assign(foundUser, userData);
    await foundUser.save();
    return foundUser;
  }

  public async deleteUser(authUser: UserType, userId: string) {
    const foundUser = await this.findUserById(userId);
    this.ownerOrAdminOnly(authUser, foundUser);
    return await foundUser.deleteOne();
  }

  ownerOrAdminOnly(authUser: UserType, foundUser: UserType) {
    if (authUser.role != UserRoles.ADMIN && authUser._id != foundUser._id) {
      throw new PermissionExcepton();
    }
  }
}

export default UserService;
