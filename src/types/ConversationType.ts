import { Document, Schema } from "mongoose";

export enum ConversationTypes {
  ONETOONE = "onetoone",
  GROUP = "group",
}

type ConversationType = Document & {
  _id: string;
  type: ConversationTypes;
  members: Schema.Types.ObjectId[]; // References to Member documents
  group?: Schema.Types.ObjectId; // Reference to Group document
} & Document<unknown, {}, ConversationType>;

export default ConversationType;
