import { Request, Response } from "express";
import { authServices } from "./auth.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IRequestUser } from "../../interface/requestUser.interface";
import { envVars } from "../../config/env.config";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/appError";
import { cookieUtils } from "../../utils/cookie";

const registerStudent = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await authServices.registerUser(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Student registered successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const loginStudent = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await authServices.loginUser(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await authServices.getMe({
    userId: (req.user as any).id,
    role: (req.user as any).role,
    email: (req.user as any).email,
  } as IRequestUser);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

const getNewToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await authServices.getNewToken(refreshToken, betterAuthSessionToken);

    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "New tokens generated successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken,
      },
    });
  }
);

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  let betterAuthSessionToken = req.cookies["better-auth.session_token"];

  if (!betterAuthSessionToken && req.headers.authorization?.startsWith("Bearer ")) {
    betterAuthSessionToken = req.headers.authorization.split(" ")[1];
  }

  if (!betterAuthSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Better Auth session token is missing");
  }

  const result = await authServices.changePassword(payload, betterAuthSessionToken);

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const logoutStudent = catchAsync(async (req: Request, res: Response) => {
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];

  if (!betterAuthSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Better Auth session token is missing");
  }

  const result = await authServices.logoutStudent(betterAuthSessionToken);

  // Clear cookies
  cookieUtils.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged out successfully",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  await authServices.verifyEmail(email, otp);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    await authServices.forgetPassword(email);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset OTP sent to email successfully",
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    await authServices.resetPassword(email, otp, newPassword);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset successfully",
    });
}); 

// /api/v1/auth/login/google?redirect=/profile
const googleLogin = catchAsync((req: Request, res: Response) => {
  const redirectPath = req.query.redirect || "/dashboard";

  const encodedRedirectPath = encodeURIComponent(redirectPath as string);

  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

  res.render("googleRedirect", {
    callbackURL: callbackURL,
    betterAuthUrl: envVars.BETTER_AUTH_URL,
  })
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.googleLoginSuccess(req.body);

  const { accessToken, refreshToken, token } = result as any;

  if (accessToken) tokenUtils.setAccessTokenCookie(res, accessToken);
  if (refreshToken) tokenUtils.setRefreshTokenCookie(res, refreshToken);
  if (token) tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Google login successful",
    data: {
      accessToken,
      refreshToken,
      sessionToken: token
    },
  });
});

const handleOAuthError = catchAsync((req: Request, res: Response) => {
  const error = req.query.error as string || "oauth_failed";
  res.redirect(`${envVars.PROD_APP_URL}/login?error=${error}`);
})

export const authController = {
  registerStudent,
  loginStudent,
  getMe,
  getNewToken,
  changePassword,
  logoutStudent,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError,
};
