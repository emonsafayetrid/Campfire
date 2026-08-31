import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js"; // Fixed import path & added extension

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    // 1. If NO validation errors exist, proceed to the controller
    if (errors.isEmpty()) {
        return next();
    }

    // 2. Extract errors into key-value pairs
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.path || err.param]: err.msg }));

    // 3. Pass ApiError to next() so Express handles it correctly
    return next(new ApiError(422, "Validation Error", extractedErrors));
};