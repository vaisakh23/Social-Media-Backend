import { Document, Types } from "mongoose";

type PostType = Document & {
  _id: string;
  content: string;
  images: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  owner: Types.ObjectId;
  reports: Types.ObjectId[];
} & Document<unknown, {}, PostType>;

export default PostType;
