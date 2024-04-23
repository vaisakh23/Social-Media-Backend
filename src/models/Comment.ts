import { model, Schema } from "mongoose";
import { schemaOptions } from "../utils/mongooseSchemaOptions";
import CommentType from "../types/CommentType";

const commentSchema: Schema<CommentType> = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    tag: Object,
    reply: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "user" }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    postId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    postUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  schemaOptions
);

const Comment = model<CommentType>("Comment", commentSchema);
export default Comment;
