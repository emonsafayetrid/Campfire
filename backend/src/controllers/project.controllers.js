import mongoose from "mongoose";

import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

import {
  AvailableUserRole,
  UserRolesEnum,
} from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },

    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project",
      },
    },

    {
      $unwind: "$project",
    },

    {
      $lookup: {
        from: "projectmembers",
        localField: "project._id",
        foreignField: "project",
        as: "projectMembers",
      },
    },

    {
      $addFields: {
        memberCount: {
          $size: "$projectMembers",
        },
      },
    },

    {
      $project: {
        _id: "$project._id",
        name: "$project.name",
        description: "$project.description",
        createdBy: "$project.createdBy",
        createdAt: "$project.createdAt",
        updatedAt: "$project.updatedAt",
        role: 1,
        memberCount: 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      projects,
      "Projects fetched successfully"
    )
  );
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const memberCount = await ProjectMember.countDocuments({
    project: project._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...project.toObject(),
        memberCount,
      },
      "Project fetched successfully"
    )
  );
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
  });

  await ProjectMember.create({
    user: req.user._id,
    project: project._id,
    role: UserRolesEnum.ADMIN,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      project,
      "Project created successfully"
    )
  );
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const updateData = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      project,
      "Project updated successfully"
    )
  );
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Task.find({
    project: project._id,
  }).select("_id");

  const taskIds = tasks.map((task) => task._id);

  if (taskIds.length > 0) {
    await SubTask.deleteMany({
      task: { $in: taskIds },
    });
  }

  await Task.deleteMany({
    project: project._id,
  });

  await ProjectMember.deleteMany({
    project: project._id,
  });

  await Project.findByIdAndDelete(project._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Project deleted successfully"
    )
  );
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  if (!AvailableUserRole.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const existingMember = await ProjectMember.findOne({
    project: project._id,
    user: user._id,
  });

  if (existingMember) {
    throw new ApiError(
      409,
      "User is already a member of this project"
    );
  }

  const member = await ProjectMember.create({
    project: project._id,
    user: user._id,
    role,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      member,
      "Member added successfully"
    )
  );
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectMembers = await ProjectMember.find({
    project: projectId,
  })
    .populate(
      "user",
      "_id username fullName email avatar isEmailVerified"
    )
    .select("user role createdAt updatedAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      projectMembers,
      "Project members fetched successfully"
    )
  );
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newrole } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new ApiError(400, "Invalid project or user ID");
  }

  if (!AvailableUserRole.includes(newrole)) {
    throw new ApiError(400, "Invalid role");
  }

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Member not found");
  }

  projectMember.role = newrole;

  await projectMember.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      projectMember,
      "Member role updated successfully"
    )
  );
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(projectId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new ApiError(400, "Invalid project or user ID");
  }

  if (req.user._id.toString() === userId) {
    throw new ApiError(
      400,
      "You cannot remove yourself from the project"
    );
  }

  const projectMember = await ProjectMember.findOneAndDelete({
    project: projectId,
    user: userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Member not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      projectMember,
      "Member deleted successfully"
    )
  );
});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
  updateMemberRole,
  deleteMember,
};