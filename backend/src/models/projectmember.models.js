import mongoose, { Schema } from "mongoose";

import {
  AvailableUserRole,
  UserRolesEnum,
} from "../utils/constants.js";

const projectMemberSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: AvailableUserRole,
      default: UserRolesEnum.MEMBER,
    },
  },
  {
    timestamps: true,
  }
);

projectMemberSchema.index(
  {
    project: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

export const ProjectMember =
  mongoose.model(
    "ProjectMember",
    projectMemberSchema
  );