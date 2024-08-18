import { model, Schema } from "mongoose";
import GroupType from "../types/GroupType";
import { schemaOptions } from "../utils/mongooseSchemaOptions";

const groupSchema: Schema = new Schema<GroupType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  schemaOptions
);

const Group = model<GroupType>("Group", groupSchema);
export default Group;
