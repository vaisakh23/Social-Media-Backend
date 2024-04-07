import { Schema, model } from "mongoose";
import { schemaOptions } from "../utils/mongooseSchemaOptions";

const UserTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
    refreshToken: { type: String, require: true },
    expireAt: { type: Date, expires: 604800 },
  },
  schemaOptions
);

const UserToken = model("UserToken", UserTokenSchema);
export default UserToken;
