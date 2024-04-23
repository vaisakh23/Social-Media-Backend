import { Document, Schema } from "mongoose";

type CommentType = Document & {
  content: string;
  tag?: object;
  reply?: Schema.Types.ObjectId | null;
  likes: Schema.Types.ObjectId[];
  owner: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
  postUserId: Schema.Types.ObjectId;
};

export default CommentType;
