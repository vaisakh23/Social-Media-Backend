import { Document, Schema } from "mongoose";

export enum MemberRoles {
  ADMIN = "admin",
  MEMBER = "member",
}

type MemberType = Document & {
  user: Schema.Types.ObjectId; // Reference to User document
  role: MemberRoles;
  memberSince?: Date;
  active?: boolean;
} & Document<unknown, {}, MemberType>;

export default MemberType;
