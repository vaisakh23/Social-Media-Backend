import { model, Schema } from "mongoose";
import UserType from "../types/UserType";
import { schemaOptions } from "../utils/mongooseSchemaOptions";
import { UserRoles } from "../utils/UserRoles";

const userSchema: Schema = new Schema<UserType>(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
    },
    role: {
      type: String,
      default: UserRoles.USER,
    },
    gender: {
      type: String,
      default: "male",
    },
    mobile: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        default:[],
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        default:[],
        ref: "User",
      },
    ],
  },
  schemaOptions
);

const User = model<UserType>("User", userSchema);
export default User;
