import { model, Schema } from "mongoose";
import PostType from "../types/PostType";
import { schemaOptions } from "../utils/mongooseSchemaOptions";

const postSchema = new Schema<PostType>(
  {
    content: String,
    images: {
      type: [String],
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reports: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  schemaOptions
);

const Post = model<PostType>("Post", postSchema);
export default Post;
