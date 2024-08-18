import { model, Schema } from "mongoose";
import { schemaOptions } from "../utils/mongooseSchemaOptions";
import MessageType, { MessageTypes } from "../types/MessageType";

const messageSchema: Schema = new Schema<MessageType>(
  {
    type: {
      type: String,
      enum: MessageTypes,
      required: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    media: {
      type: String,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    systemMessageToOthers: {
      type: String,
    },
    systemMessageToSender: {
      type: String,
    },
    systemMessageToReceiver: {
      type: String,
    },
  },
  schemaOptions
);

const Message = model<MessageType>("Message", messageSchema);
export default Message;
