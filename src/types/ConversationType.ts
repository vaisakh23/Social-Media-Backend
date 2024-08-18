import { Document, Schema } from "mongoose";

export enum ConversationTypes {
  ONETOONE = "onetoone",
  GROUP = "group",
}

type ConversationType = Document & {
  _id: string;
  type: ConversationTypes;
  members: Schema.Types.ObjectId[]; // References to User documents
  group?: Schema.Types.ObjectId; // Reference to Group document
  lastMessageDate: Date;
  lastMessageSender: Schema.Types.ObjectId;
  lastMessageToOthers: string;
  lastMessageToSender: string;
  name?: string;
  image?: string;
} & Document<unknown, {}, ConversationType>;

export default ConversationType;
