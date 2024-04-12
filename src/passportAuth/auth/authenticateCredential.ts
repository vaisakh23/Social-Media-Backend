import { compare } from "bcrypt";
import UnauthorizedException from "../../exceptions/UnauthorizedException";
import User from "../../models/User";

export const authenticateCredential = async (
  username: string,
  password: string,
  done: any
) => {
  try {
    const findUser = await User.findOne({ email: username }).select(
      "+password"
    );
    if (!findUser) {
      throw new UnauthorizedException(
        `No account registered for email ${username}`
      );
    }
    const result = await compare(password, findUser.password);
    if (!result) {
      throw new UnauthorizedException(`Incorrect password`);
    }
    return done(null, findUser.toObject());
  } catch (error) {
    return done(error, false);
  }
};
