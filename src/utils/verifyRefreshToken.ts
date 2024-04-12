import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../configs";
import UnauthorizedException from "../exceptions/UnauthorizedException";

export const verifyRefreshToken = (refreshToken: string) => {
  return new Promise(async (resolve, reject) => {
    jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET,
      (error: any, payload: any) => {
        if (error || !payload) {
          return reject(new UnauthorizedException("Invalid refresh token"));
        }
        const { _id, email } = payload;
        return resolve({ _id, email });
      }
    );
  });
};
