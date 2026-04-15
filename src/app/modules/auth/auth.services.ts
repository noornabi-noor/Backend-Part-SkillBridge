import status from "http-status";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interface/requestUser.interface";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { IChangePasswordPayload, IRegisterUserPayload, IResetPasswordPayload, ISignInUserPayload } from "./auth.interface";
import { Role, UserStatus } from "../../../../generated/prisma/enums";
import AppError from "../../errorHelpers/appError";
import { envVars } from "../../config/env.config";

const registerUser = async (payload: IRegisterUserPayload): Promise<any> => {
  const { name, email, password, role, tutorProfile } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      role: role || Role.STUDENT,
    },
  });

  try {
    const userRole = data.user.role as Role;

    await prisma.$transaction(async (tx) => {
      // If the user registered as a Tutor, forcefully ensure TutorProfile is created
      if (userRole === Role.TUTOR) {
        await tx.tutorProfile.create({
          data: {
            userId: data.user.id,
            pricePerHour: tutorProfile?.pricePerHour ?? 0,
            experience: tutorProfile?.experience ?? 0,
            bio: tutorProfile?.bio || null,
          },
        });
      }
    });

    // In a fresh signup, user status is dynamically default ACTIVE
    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: userRole,
      name: data.user.name,
      email: data.user.email,
      status: UserStatus.ACTIVE,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: userRole,
      name: data.user.name,
      email: data.user.email,
      status: UserStatus.ACTIVE,
      emailVerified: data.user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log("Transaction error: ", error);
    // rollback user creation if profile creation fails
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });

    throw error;
  }
};

const loginUser = async (payload: ISignInUserPayload): Promise<any> => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  const dbUser = await prisma.user.findUnique({
    where: { id: data.user.id }
  });

  if (!dbUser || dbUser.status === UserStatus.BANNED) {
    throw new AppError(status.BAD_REQUEST, "User is banned or not found!");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: dbUser.id,
    role: dbUser.role as Role,
    name: dbUser.name,
    email: dbUser.email,
    status: dbUser.status as UserStatus,
    emailVerified: dbUser.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: dbUser.id,
    role: dbUser.role as Role,
    name: dbUser.name,
    email: dbUser.email,
    status: dbUser.status as UserStatus,
    emailVerified: dbUser.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      tutorProfile: {
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          tutorAvailabilities: {
            include: {
              availability: true,
            },
          },
          reviews: true,
        }
      },
      studentBookings: {
        include: {
          tutor: true,
          payment: true,
          review: true,
        }
      },
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExists;
};

const getNewToken = async (refreshToken: string, sessionToken: string): Promise<any> => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionTokenExists) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh Token!");
  }

  if (isSessionTokenExists.user.status === UserStatus.BANNED) {
    throw new AppError(status.BAD_REQUEST, "User is banned!");
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh Token!");
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: isSessionTokenExists.user.role as Role,
    name: data.name,
    email: data.email,
    status: isSessionTokenExists.user.status as UserStatus,
    emailVerified: isSessionTokenExists.user.emailVerified,
  });

  const NewRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: isSessionTokenExists.user.role as Role,
    name: data.name,
    email: data.email,
    status: isSessionTokenExists.user.status as UserStatus,
    emailVerified: isSessionTokenExists.user.emailVerified,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: NewRefreshToken,
    sessionToken: token,
  };
};

const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token!");
  }

  const { currentPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  // 1. Fetch fresh user data from database after password change
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser) {
    throw new AppError(status.NOT_FOUND, "User not found after password change!");
  }

  // 2. Clear needPasswordChanged flag if it was set
  if (dbUser.needPasswordChanged) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { needPasswordChanged: false }
    });
  }

  // 3. Generate tokens with fresh database data
  const accessToken = tokenUtils.getAccessToken({
    userId: dbUser.id,
    role: dbUser.role as Role,
    name: dbUser.name,
    email: dbUser.email,
    status: dbUser.status as UserStatus,
    isDeleted: dbUser.isDeleted,
    emailVerified: dbUser.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: dbUser.id,
    role: dbUser.role as Role,
    name: dbUser.name,
    email: dbUser.email,
    status: dbUser.status as UserStatus,
    isDeleted: dbUser.isDeleted,
    emailVerified: dbUser.emailVerified,
  });

  return {
    ...result,
    accessToken,
    refreshToken,
    token: sessionToken,
  };
};

const logoutStudent = async (sessionToken: string) => {
  await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
};

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      }
    })
  }
};

const forgetPassword = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    }
  })

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.sendVerificationOTP({
    body: {
      email,
      type: "forget-password",
    }
  })
};

const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    }
  })

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    }
  })

  if (isUserExist.needPasswordChanged) {
    await prisma.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        needPasswordChanged: false,
      }
    })
  }

  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id,
    }
  })
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session: Record<string, any>) => {
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser) {
    throw new AppError(status.NOT_FOUND, "User not found after Google OAuth flow!");
  }

  if (dbUser.status === UserStatus.BANNED) {
    throw new AppError(status.FORBIDDEN, "Your account has been banned!");
  }

  if (dbUser.isDeleted || dbUser.status === UserStatus.DELETED) {
    throw new AppError(status.FORBIDDEN, "Your account has been deleted!");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: dbUser.id,
    role: dbUser.role as Role,
    name: dbUser.name,
    email: dbUser.email,
    status: dbUser.status as UserStatus,
    emailVerified: dbUser.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: dbUser.id,
    role: dbUser.role as Role,
    name: dbUser.name,
    email: dbUser.email,
    status: dbUser.status as UserStatus,
    emailVerified: dbUser.emailVerified,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const authServices = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutStudent,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess,
};