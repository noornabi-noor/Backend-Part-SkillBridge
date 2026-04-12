import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import AppError from "../errorHelpers/appError";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { envVars } from "../config/env.config";
import { jwtUtils } from "../utils/jwt";
import { cookieUtils } from "../utils/cookie";

export const checkAuth =
  (...authRoles: Role[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        //Session Token Verification
        let sessionToken = cookieUtils.getCookie(
          req,
          "better-auth.session_token",
        );

        if (!sessionToken && req.headers.authorization?.startsWith("Bearer ")) {
          sessionToken = req.headers.authorization.split(" ")[1];
        }

        if (sessionToken) {
          const session = await auth.api.getSession({
            headers: new Headers({
              Authorization: `Bearer ${sessionToken}`,
            }),
          });

          if (session && session.user) {
            // Fetch the user with tutorProfileId if it exists
            const user = await prisma.user.findUnique({
              where: { id: session.user.id },
              include: {
                tutorProfile: {
                  select: { id: true },
                },
              },
            });

            if (!user) {
              throw new AppError(status.UNAUTHORIZED, "User not found associated with this session.");
            }

            if (user.status === UserStatus.BANNED) {
              throw new AppError(
                status.UNAUTHORIZED,
                "Unauthorized access! User account is banned.",
              );
            }

            if (authRoles.length > 0 && !authRoles.includes(user.role as any)) {
              throw new AppError(
                status.FORBIDDEN,
                "Forbidden access! You do not have permission to access this resource.",
              );
            }

            req.user = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role as Role,
              emailVerified: user.emailVerified,
              tutorProfileId: user.tutorProfile?.id ?? null,
              ...(user.image != null ? { image: user.image } : {}),
            };

            next();
            return;
          }
        }

        //Access Token Verification
        let accessToken = cookieUtils.getCookie(req, "accessToken");

        if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
          accessToken = req.headers.authorization.split(" ")[1];
        }

        if (!accessToken) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! No access token or session provided.",
          );
        }

        const verifiedToken = jwtUtils.verifyToken(
          accessToken,
          envVars.ACCESS_TOKEN_SECRET,
        );

        if (!verifiedToken.success) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! Invalid access token.",
          );
        }

        // Fetch user details for complete profile info
        const dbUser = await prisma.user.findUnique({
          where: { id: verifiedToken.data!.userId },
          include: {
            tutorProfile: {
              select: { id: true },
            },
          },
        });

        if (!dbUser) {
          throw new AppError(
            status.UNAUTHORIZED,
            "User not found in database.",
          );
        }

        if (
          authRoles.length > 0 &&
          !authRoles.includes(dbUser.role as any)
        ) {
          throw new AppError(
            status.FORBIDDEN,
            "Forbidden access! You do not have permission to access this resource.",
          );
        }

        req.user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role as Role,
          emailVerified: dbUser.emailVerified,
          tutorProfileId: dbUser.tutorProfile?.id ?? null,
          ...(dbUser.image != null ? { image: dbUser.image } : {}),
        };

        next();
      } catch (error: any) {
        next(error);
      }
    };
