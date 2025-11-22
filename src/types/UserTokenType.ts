import { Document, Types } from "mongoose";

type UserTokenType = {
  _id: string;
  user: Types.ObjectId;
  jti: string;
  tokenHash: string;
  ip?: string;
  userAgent?: string;
  deviceName?: string;
  revoked: boolean
} & Document<unknown, {}, UserTokenType>;

export default UserTokenType;
