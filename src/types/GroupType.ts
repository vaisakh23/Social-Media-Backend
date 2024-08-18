import { Document, Schema } from "mongoose";

type GroupType = Document & {
  name: string;
  image?: string;
  createdBy: Schema.Types.ObjectId; // Reference to User document
} & Document<unknown, {}, GroupType>;

export default GroupType;
