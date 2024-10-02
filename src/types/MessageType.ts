import { Document, Schema } from "mongoose";

export enum MessageTypes {
  USER = "user",
  SYSTEM = "system",
}

type MessageType = Document & {
  type: "user" | "system";
  conversation: Schema.Types.ObjectId; // Reference to Conversation document
  sender?: Schema.Types.ObjectId; // Reference to User document (for user messages)
  text?: string;
  media?: string;
  receiver?: Schema.Types.ObjectId; // Reference to User document (for one-to-one messages)
  systemMessageToOthers?: string;
  systemMessageToSender?: string;
  systemMessageToReceiver?: string;
  createdAt?: Date;
} & Document<unknown, {}, MessageType>;

export default MessageType;
