import { model, Schema } from "mongoose";
import ConversationType, { ConversationTypes } from "../types/ConversationType";
import { schemaOptions } from "../utils/mongooseSchemaOptions";

const conversationSchema: Schema = new Schema<ConversationType>(
  {
    type: {
      type: String,
      enum: ConversationTypes,
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  schemaOptions
);

const Conversation = model<ConversationType>(
  "Conversation",
  conversationSchema
);
export default Conversation;
