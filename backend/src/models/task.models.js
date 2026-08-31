import mongoose, { Schema } from "mongoose";
import {
  TaskStatusEnum,
  AvailableTaskStatuses,
} from "../utils/constants.js";

const taskSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: AvailableTaskStatuses,
      default: TaskStatusEnum.TODO,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attachments: {
      type: [
        {
          url: String,
          mimeType: String,
          localPath: String,
          size: Number,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model("Task", taskSchema);