import mongoose from "mongoose";

import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Task.find({
    project: projectId,
  })
    .populate(
      "assignedTo",
      "_id avatar username fullName email"
    )
    .populate(
      "assignedBy",
      "_id avatar username fullName email"
    );

  return res.status(200).json(
    new ApiResponse(
      200,
      tasks,
      "Tasks fetched successfully"
    )
  );
});

const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    assignedTo,
    status,
  } = req.body;

  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      throw new ApiError(400, "Invalid assignedTo user ID");
    }

    const assignedUser = await ProjectMember.findOne({
      project: projectId,
      user: assignedTo,
    });

    if (!assignedUser) {
      throw new ApiError(
        400,
        "Assigned user is not a member of this project"
      );
    }
  }

  const files = req.files || [];

  const attachments = files.map((file) => ({
    url: `${process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`}/images/${file.filename}`,
    mimeType: file.mimetype,
    localPath: file.path,
    size: file.size,
  }));

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo: assignedTo || undefined,
    status: status || "todo",
    attachments,
    assignedBy: req.user._id,
  });

  const populatedTask = await Task.findById(task._id)
    .populate(
      "assignedTo",
      "_id avatar username fullName email"
    )
    .populate(
      "assignedBy",
      "_id avatar username fullName email"
    );

  return res.status(201).json(
    new ApiResponse(
      201,
      populatedTask,
      "Task created successfully"
    )
  );
});

const getTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(taskId)
  ) {
    throw new ApiError(400, "Invalid project or task ID");
  }

  const task = await Task.findOne({
    _id: taskId,
    project: projectId,
  })
    .populate(
      "assignedTo",
      "_id username fullName avatar email"
    )
    .populate(
      "assignedBy",
      "_id username fullName avatar email"
    );

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtasks = await SubTask.find({
    task: task._id,
  }).populate(
    "createdBy",
    "_id username fullName avatar email"
  );

  const taskData = {
    ...task.toObject(),
    subtasks,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      taskData,
      "Task fetched successfully"
    )
  );
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const {
    title,
    description,
    assignedTo,
    status,
  } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(taskId)
  ) {
    throw new ApiError(400, "Invalid project or task ID");
  }

  const task = await Task.findOne({
    _id: taskId,
    project: projectId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      throw new ApiError(400, "Invalid assignedTo user ID");
    }

    const assignedUser = await ProjectMember.findOne({
      project: projectId,
      user: assignedTo,
    });

    if (!assignedUser) {
      throw new ApiError(
        400,
        "Assigned user is not a member of this project"
      );
    }

    task.assignedTo = assignedTo;
  }

  if (title !== undefined) {
    task.title = title;
  }

  if (description !== undefined) {
    task.description = description;
  }

  if (status !== undefined) {
    task.status = status;
  }

  const files = req.files || [];

  if (files.length > 0) {
    const newAttachments = files.map((file) => ({
      url: `${process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`}/images/${file.filename}`,
      mimeType: file.mimetype,
      localPath: file.path,
      size: file.size,
    }));

    task.attachments = [
      ...task.attachments,
      ...newAttachments,
    ];
  }

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate(
      "assignedTo",
      "_id username fullName avatar email"
    )
    .populate(
      "assignedBy",
      "_id username fullName avatar email"
    );

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedTask,
      "Task updated successfully"
    )
  );
});

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(taskId)
  ) {
    throw new ApiError(400, "Invalid project or task ID");
  }

  const task = await Task.findOne({
    _id: taskId,
    project: projectId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await SubTask.deleteMany({
    task: task._id,
  });

  await Task.findByIdAndDelete(task._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Task deleted successfully"
    )
  );
});

const createSubTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(taskId)
  ) {
    throw new ApiError(400, "Invalid project or task ID");
  }

  const task = await Task.findOne({
    _id: taskId,
    project: projectId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subTask = await SubTask.create({
    title,
    task: task._id,
    createdBy: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      subTask,
      "Subtask created successfully"
    )
  );
});

const updateSubTask = asyncHandler(async (req, res) => {
  const {
    projectId,
    taskId,
    subTaskId,
  } = req.params;

  const {
    title,
    isCompleted,
  } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(taskId) ||
    !mongoose.Types.ObjectId.isValid(subTaskId)
  ) {
    throw new ApiError(
      400,
      "Invalid project, task or subtask ID"
    );
  }

  const task = await Task.findOne({
    _id: taskId,
    project: projectId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subTask = await SubTask.findOne({
    _id: subTaskId,
    task: taskId,
  });

  if (!subTask) {
    throw new ApiError(404, "Subtask not found");
  }

  if (title !== undefined) {
    subTask.title = title;
  }

  if (isCompleted !== undefined) {
    subTask.isCompleted = isCompleted;
  }

  await subTask.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      subTask,
      "Subtask updated successfully"
    )
  );
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const {
    projectId,
    taskId,
    subTaskId,
  } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(taskId) ||
    !mongoose.Types.ObjectId.isValid(subTaskId)
  ) {
    throw new ApiError(
      400,
      "Invalid project, task or subtask ID"
    );
  }

  const task = await Task.findOne({
    _id: taskId,
    project: projectId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subTask = await SubTask.findOneAndDelete({
    _id: subTaskId,
    task: taskId,
  });

  if (!subTask) {
    throw new ApiError(404, "Subtask not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Subtask deleted successfully"
    )
  );
});

export {
  getTask,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};