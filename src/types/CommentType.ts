import { Document, Schema } from "mongoose";

type CommentType = Document & {
  _id: string;
  content: string;
  tag?: object;
  reply?: Schema.Types.ObjectId | null;
  likes: Schema.Types.ObjectId[];
  owner: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
  postOwnerId: Schema.Types.ObjectId;
} & Document<unknown, {}, CommentType>;

export default CommentType;
