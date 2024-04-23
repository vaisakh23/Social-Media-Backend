import { Document, Types } from "mongoose";

type UserType = {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  role?: string;
  gender?: string;
  mobile?: string;
  address?: string;
  followers?: Types.ObjectId[];
  following?: Types.ObjectId[];
} & Document<unknown, {}, UserType>;

export default UserType;
