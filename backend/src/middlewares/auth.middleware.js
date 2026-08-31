import jwt from "jsonwebtoken";

import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const verifyJWT = asyncHandler(
  async (req, res, next) => {
    const token =
      req.cookies?.accessToken ||
      req
        .header("Authorization")
        ?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(
        401,
        "Unauthorized: No token provided"
      );
    }

    try {
      const decodedToken =
        jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET
        );

      const user = await User.findById(
        decodedToken?._id
      ).select(
        "-password -emailVerificationToken -emailVerificationExpiry -refreshToken"
      );

      if (!user) {
        throw new ApiError(
          401,
          "Unauthorized: Invalid access token"
        );
      }

      req.user = user;

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        401,
        "Unauthorized: Invalid token"
      );
    }
  }
);

export const validateProjectPermission = (
  allowedRoles = []
) =>
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(
        400,
        "Project ID is required"
      );
    }

    const projectMember =
      await ProjectMember.findOne({
        project: projectId,
        user: req.user._id,
      });

    if (!projectMember) {
      throw new ApiError(
        403,
        "You are not a member of this project"
      );
    }

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(
        projectMember.role
      )
    ) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action"
      );
    }

    req.projectMember =
      projectMember;

    next();
  });