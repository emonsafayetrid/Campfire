import { body } from "express-validator";
import { AvailableUserRole, AvailableTaskStatuses } from "../utils/constants.js";

export const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required"),

    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required")
      .isLength({ min: 3 })
      .withMessage("Full name must be at least 3 characters long"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required"),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body("currentPassword")
      .trim()
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ];
};

const ResetForgotPasswordValidator = () => {
  return [
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required"),
  ];
};

const createProjectValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Project name is required"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Project description is required"),
  ];
};

const addMembertoProjectValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("role")
      .trim()
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRole)
      .withMessage("Invalid role"),
  ];
};

const createTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Task title is required"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Task description cannot be empty"),
    body("assignedTo")
      .optional()
      .trim()
      .isMongoId()
      .withMessage("Invalid assignedTo user id"),
    body("status")
      .optional()
      .trim()
      .isIn(AvailableTaskStatuses)
      .withMessage("Invalid task status"),
  ];
};

const updateTaskValidator = () => {
  return [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Task title cannot be empty"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Task description cannot be empty"),
    body("assignedTo")
      .optional()
      .trim()
      .isMongoId()
      .withMessage("Invalid assignedTo user id"),
    body("status")
      .optional()
      .trim()
      .isIn(AvailableTaskStatuses)
      .withMessage("Invalid task status"),
  ];
};

const createSubTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Subtask title is required"),
  ];
};

const updateSubTaskValidator = () => {
  return [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Subtask title cannot be empty"),
    body("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("isCompleted must be true or false"),
  ];
};

export {
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  ResetForgotPasswordValidator,
  createProjectValidator,
  addMembertoProjectValidator,
  createTaskValidator,
  updateTaskValidator,
  createSubTaskValidator,
  updateSubTaskValidator,
};
