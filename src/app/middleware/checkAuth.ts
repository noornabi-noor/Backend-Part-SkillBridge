import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { prisma } from "../lib/prisma";
import AppError from "../errorHelpers/appError";
import { UserStatus } from "../../../generated/prisma/client";
import { envVars } from "../config/env.config";
import { jwtUtils } from "../utils/jwt";
import { cookieUtils } from "../utils/cookie";
import { userRoles } from "./auth";

export const checkAuth =
  (...authRoles: userRoles[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        //Session Token Verification
        const sessionToken = cookieUtils.getCookie(
          req,
          "better-auth.session_token",
        );

        if (sessionToken) {
          const sessionExists = await prisma.session.findFirst({
            where: {
              token: sessionToken,
              expiresAt: {
                gt: new Date(),
              },
            },
            include: {
              user: {
                include: {
                  tutorProfile: {
                    select: { id: true },
                  },
                },
              },
            },
          });

          if (sessionExists && sessionExists.user) {
            const user = sessionExists.user;

            const now = new Date();
            const expiresAt = new Date(sessionExists.expiresAt);
            const createdAt = new Date(sessionExists.createdAt);

            const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
            const timeRemaining = expiresAt.getTime() - now.getTime();
            const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

            if (percentRemaining < 20) {
              res.setHeader("X-Session-Refresh", "true");
              res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
              res.setHeader("X-Time-Remaining", timeRemaining.toString());

              console.log("Session Expiring Soon!!");
            }

            if (user.status === UserStatus.BANNED) {
              throw new AppError(
                status.UNAUTHORIZED,
                "Unauthorized access! User account is banned.",
              );
            }

            if (authRoles.length > 0 && !authRoles.includes(user.role as userRoles)) {
              throw new AppError(
                status.FORBIDDEN,
                "Forbidden access! You do not have permission to access this resource.",
              );
            }

            req.user = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role as userRoles,
              emailVerified: user.emailVerified,
              tutorProfileId: user.tutorProfile?.id ?? null,
              ...(user.image != null ? { image: user.image } : {}),
            };

            next();
            return;
          }
        }

        //Access Token Verification
        const accessToken = cookieUtils.getCookie(req, "accessToken");

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

        if (
          authRoles.length > 0 &&
          !authRoles.includes(verifiedToken.data!.role as userRoles)
        ) {
          throw new AppError(
            status.FORBIDDEN,
            "Forbidden access! You do not have permission to access this resource.",
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

        req.user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role as userRoles,
          emailVerified: dbUser.emailVerified,
          tutorProfileId: dbUser.tutorProfile?.id ?? null,
          ...(dbUser.image != null ? { image: dbUser.image } : {}),
        };

        next();
      } catch (error: any) {
        next(error);
      }
    };
