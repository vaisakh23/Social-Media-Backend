import { ResolveSchemaOptions } from "mongoose";

export const schemaOptions: any = {
  timestamps: true,
  toJSON: {
    transform: function (doc: any, ret: { __v: any }, game: any) {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: function (doc: any, ret: any, game: any) {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
};
