import { model, Schema } from "mongoose";
import UserType from "../types/UserType";
import { schemaOptions } from "../utils/mongooseSchemaOptions";
import { UserRoles } from "../utils/UserRoles";

const userSchema: Schema = new Schema<UserType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: String,
  },
  schemaOptions
);

const User = model<UserType>("User", userSchema);
export default User;
