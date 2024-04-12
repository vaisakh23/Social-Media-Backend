import UnauthorizedException from "../../exceptions/UnauthorizedException";
import User from "../../models/User";
import UserType from "../../types/UserType";

export const authenticateToken = async (jwt_payload: UserType, done: any) => {
  try {
    const findUser = await User.findOne({ _id: jwt_payload._id }).select(
      "+password"
    );
    if (!findUser) {
      throw new UnauthorizedException("Token is invalid or expired.");
    }
    return done(null, findUser);
  } catch (error) {
    return done(error, false);
  }
};
