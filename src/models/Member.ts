import { model, Schema } from "mongoose";
import MemberType, { MemberRoles } from "../types/MemberType";
import { schemaOptions } from "../utils/mongooseSchemaOptions";

const memberSchema: Schema = new Schema<MemberType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: MemberRoles,
      required: true,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true, // true if active, false if removed from group
    },
  },
  schemaOptions
);

const Member = model<MemberType>("Member", memberSchema);
export default Member;
