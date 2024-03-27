import { model, Schema } from "mongoose";
import UserType from "../types/UserType";

const userSchema: Schema = new Schema<UserType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform: function (doc, ret, game) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const User = model<UserType>("User", userSchema);
export default User;
