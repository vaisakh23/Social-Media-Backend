import { hash } from "bcrypt";
import HttpException from "../exceptions/HttpException";
import NotFoundException from "../exceptions/NotFoundException";
import PermissionException from "../exceptions/PermissionException";
import User from "../models/User";
import UserType from "../types/UserType";
import { UserRoles } from "../utils/UserRoles";
import ApiFeatures from "../utils/ApiFeatures";

class UserService {
  public users = User;

  public async findAllUser(queryString: any) {
    const searchFields = ["fullname", "username", "email", "mobile"];
    const apiFeature = new ApiFeatures(
      this.users.find(),
      queryString,
      searchFields
    );
    const { page = 1, limit = 9 } = queryString;
    const total = await apiFeature.countDocuments();
    const users = await apiFeature.executeQuery();
    return {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      users,
    };
  }

  public async findUserById(userId: string) {
    const findUser = await this.users.findOne({ _id: userId });
    if (!findUser) throw new NotFoundException("User doesn't exist");
    return findUser;
  }

  public async createUser(userData: any) {
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

  public async follow(authUser: UserType, userIdToFollow: string) {
    const userToFollow = await this.findUserById(userIdToFollow);
    const updatedUser = await this.users
      .findOneAndUpdate(
        { _id: authUser._id },
        { $addToSet: { followers: userToFollow } },
        { new: true }
      )
      .populate("followers following");
    await this.users.findOneAndUpdate(
      { _id: userToFollow._id },
      { $addToSet: { following: authUser } }
    );
    return updatedUser;
  }

  public async unFollow(authUser: UserType, userIdToUnfollow: string) {
    const userToUnFollow = await this.findUserById(userIdToUnfollow);
    const updatedUser = await this.users
      .findOneAndUpdate(
        { _id: authUser._id },
        { $pull: { followers: userToUnFollow._id } },
        { new: true }
      )
      .populate("followers following");
    await this.users.findOneAndUpdate(
      { _id: userToUnFollow._id },
      { $pull: { following: authUser._id } }
    );
    return updatedUser;
  }

  ownerOrAdminOnly(authUser: UserType, foundUser: UserType) {
    if (authUser.role != UserRoles.ADMIN && authUser._id != foundUser._id) {
      throw new PermissionException();
    }
  }
}

export default UserService;
