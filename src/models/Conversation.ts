import { model, Schema } from "mongoose";
import ConversationType, { ConversationTypes } from "../types/ConversationType";
import { schemaOptions } from "../utils/mongooseSchemaOptions";

const conversationSchema: Schema = new Schema<ConversationType>(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
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
    lastMessageDate: {
      type: Date,
      required: true,
    },
    lastMessageSender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessageToOthers: {
      type: String,
      required: true,
    },
    lastMessageToSender: {
      type: String,
    },
  },
  schemaOptions
);

const Conversation = model<ConversationType>(
  "Conversation",
  conversationSchema
);
export default Conversation;
