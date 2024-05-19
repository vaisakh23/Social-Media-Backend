import { model, Schema } from "mongoose";
import { schemaOptions } from "../utils/mongooseSchemaOptions";
import CommentType from "../types/CommentType";

const commentSchema: Schema<CommentType> = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    postId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    postOwnerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  schemaOptions
);

const Comment = model<CommentType>("Comment", commentSchema);
export default Comment;
