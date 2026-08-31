import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

import {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
} from "../utils/mail.js";

import jwt from "jsonwebtoken";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    fullName,
  } = req.body;

  const existingUser = await User.findOne({
    $or: [
      { username },
      { email },
    ],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User already exists"
    );
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    isEmailVerified: false,
  });

  const {
    unhashedToken,
    hashedToken,
    tokenExpiry,
  } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({
    validateBeforeSave: false,
  });

  await sendEmail({
    email: user.email,
    subject: "Email Verification",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify-email/${unhashedToken}`
    ),
  });

  const createdUser = await User.findById(
    user._id
  ).select(
    "-password -emailVerificationToken -emailVerificationExpiry -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "User creation failed"
    );
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      createdUser,
      "User registered successfully. Please check your email to verify your account."
    )
  );
});

const generateAccessAndRefreshToken = async (
  userId
) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }

    const accessToken =
      user.generateAccessToken();

    const refreshToken =
      user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      "Something went wrong while generating tokens"
    );
  }
};

const login = asyncHandler(async (req, res) => {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    throw new ApiError(
      400,
      "Email and password are required"
    );
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  const isPasswordValid =
    await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid credentials"
    );
  }

  const {
    accessToken,
    refreshToken,
  } =
    await generateAccessAndRefreshToken(
      user._id
    );

  const loggedInUser =
    await User.findById(user._id).select(
      "-password -emailVerificationToken -emailVerificationExpiry -refreshToken"
    );

  const options = {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  };

  return res
    .status(200)
    .cookie(
      "refreshToken",
      refreshToken,
      options
    )
    .cookie(
      "accessToken",
      accessToken,
      options
    )
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});

const logoutUser = asyncHandler(
  async (req, res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      }
    );

    const options = {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    };

    return res
      .status(200)
      .clearCookie(
        "accessToken",
        options
      )
      .clearCookie(
        "refreshToken",
        options
      )
      .json(
        new ApiResponse(
          200,
          {},
          "User logged out"
        )
      );
  }
);

const getCurrentUser = asyncHandler(
  async (req, res) => {
    return res.status(200).json(
      new ApiResponse(
        200,
        req.user,
        "Current user fetched successfully"
      )
    );
  }
);

const verifyEmail = asyncHandler(
  async (req, res) => {
    const {
      verificationToken,
    } = req.params;

    if (!verificationToken) {
      throw new ApiError(
        400,
        "Verification token is required"
      );
    }

    const hashedToken =
      crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOne({
      emailVerificationToken:
        hashedToken,
      emailVerificationExpiry: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      throw new ApiError(
        400,
        "Invalid or expired verification token"
      );
    }

    user.emailVerificationToken =
      undefined;

    user.emailVerificationExpiry =
      undefined;

    user.isEmailVerified = true;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isEmailVerified: true,
        },
        "Email verified successfully"
      )
    );
  }
);

const resendEmailVerification =
  asyncHandler(async (req, res) => {
    const user =
      await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }

    if (user.isEmailVerified) {
      throw new ApiError(
        400,
        "Email is already verified"
      );
    }

    const {
      unhashedToken,
      hashedToken,
      tokenExpiry,
    } =
      user.generateTemporaryToken();

    user.emailVerificationToken =
      hashedToken;

    user.emailVerificationExpiry =
      tokenExpiry;

    await user.save({
      validateBeforeSave: false,
    });

    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      mailgenContent:
        emailVerificationMailgenContent(
          user.username,
          `${req.protocol}://${req.get(
            "host"
          )}/api/v1/auth/verify-email/${unhashedToken}`
        ),
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Verification email resent successfully. Please check your email."
      )
    );
  });

const refreshAccessToken =
  asyncHandler(async (req, res) => {
    const incomingRefreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(
        401,
        "Unauthorized: No refresh token provided"
      );
    }

    try {
      const decodedToken =
        jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

      const user = await User.findById(
        decodedToken?._id
      );

      if (
        !user ||
        incomingRefreshToken !==
          user.refreshToken
      ) {
        throw new ApiError(
          401,
          "Unauthorized: Invalid refresh token"
        );
      }

      const {
        accessToken,
        refreshToken:
          newRefreshToken,
      } =
        await generateAccessAndRefreshToken(
          user._id
        );

      const options = {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",
      };

      return res
        .status(200)
        .cookie(
          "refreshToken",
          newRefreshToken,
          options
        )
        .cookie(
          "accessToken",
          accessToken,
          options
        )
        .json(
          new ApiResponse(
            200,
            {
              accessToken,
              refreshToken:
                newRefreshToken,
            },
            "Access token refreshed successfully"
          )
        );
    } catch (error) {
      throw new ApiError(
        401,
        "Unauthorized: Invalid refresh token"
      );
    }
  });

const forgotPasswordRequest =
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }

    const {
      unhashedToken,
      hashedToken,
      tokenExpiry,
    } =
      user.generateTemporaryToken();

    user.forgotPasswordToken =
      hashedToken;

    user.forgotPasswordExpiry =
      tokenExpiry;

    await user.save({
      validateBeforeSave: false,
    });

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      mailgenContent:
        forgotPasswordMailgenContent(
          user.username,
          `${process.env.FORGOT_PASSWORD_REDIRECT_URL}?token=${unhashedToken}`
        ),
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Password reset email sent successfully. Please check your email."
      )
    );
  });

const resetForgotPassword =
  asyncHandler(async (req, res) => {
    const {
      resetToken,
    } = req.params;

    const {
      newPassword,
    } = req.body;

    const hashedToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
      forgotPasswordToken:
        hashedToken,
      forgotPasswordExpiry: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      throw new ApiError(
        400,
        "Invalid or expired reset token"
      );
    }

    user.forgotPasswordToken =
      undefined;

    user.forgotPasswordExpiry =
      undefined;

    user.password = newPassword;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Password reset successfully"
      )
    );
  });

const changeCurrentPassword =
  asyncHandler(async (req, res) => {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }

    const isPasswordValid =
      await user.comparePassword(
        currentPassword
      );

    if (!isPasswordValid) {
      throw new ApiError(
        401,
        "Current password is incorrect"
      );
    }

    user.password = newPassword;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Password changed successfully"
      )
    );
  });

export {
  registerUser,
  login,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword,
};