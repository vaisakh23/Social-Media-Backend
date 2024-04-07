import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_TIMOUT,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_TIMOUT,
} from "../configs";
import HttpException from "../exceptions/HttpException";
import User from "../models/User";
import UserToken from "../models/UserToken";
import UserType from "../types/UserType";
import { verifyRefreshToken } from "../utils/verifyRefreshToken";
import UnauthorizedException from "../exceptions/UnauthorizedException ";

class AuthService {
  private user = User;
  private userToken = UserToken;

  public async signup(userData: UserType) {
    const findUser: UserType | null = await this.user.findOne({
      email: userData.email,
    });
    if (findUser)
      throw new HttpException(
        `This email ${userData.email} already exists`,
        409
      );

    const hashedPassword = await hash(userData.password, 10);
    const createUserData = await this.user.create({
      ...userData,
      password: hashedPassword,
    });
    const userObject = createUserData.toObject();
    const tokens = await this.generateTokens(userObject);
    return { user: userObject, ...tokens };
  }

  public async login(user: UserType) {
    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  public async refreshToken(refreshToken: string) {
    const payload = await this.verifyAndDeleteRefreshToken(refreshToken);
    return await this.generateTokens(payload);
  }

  private async generateTokens(user: any) {
    const { _id, email } = user;
    const accessToken = jwt.sign({ _id, email }, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TIMOUT,
    });
    const refreshToken = jwt.sign({ _id, email }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_TIMOUT,
    });

    await this.userToken.create({
      user: user._id,
      refreshToken,
    });
    return { accessToken, refreshToken };
  }

  private async verifyAndDeleteRefreshToken(refreshToken: string) {
    const payload: any = await verifyRefreshToken(refreshToken);
    const userToken = await this.userToken.findOneAndDelete({
      user: payload._id,
      refreshToken,
    });
    if (!userToken) throw new UnauthorizedException("Invalid refresh token");
    return payload;
  }
}

export default AuthService;
