import { Document, Types } from "mongoose";

type PostType = Document & {
  content: string;
  images: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  owner: Types.ObjectId;
  reports: Types.ObjectId[];
};

export default PostType;
