import { Schema, model } from "mongoose";
import { schemaOptions } from "../utils/mongooseSchemaOptions";
import UserTokenType from "../types/UserTokenType";

const UserTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
    jti: { type: String, required: true, index: true, unique: true },
    tokenHash: { type: String, required: true },
    ip: String,
    userAgent: String,
    deviceName: String,
    revoked: { type: Boolean, default: false, require: true },
  },
  schemaOptions
);

const UserToken = model<UserTokenType>("UserToken", UserTokenSchema);
export default UserToken;
