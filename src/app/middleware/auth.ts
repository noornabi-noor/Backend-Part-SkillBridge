// src/middleware/auth.ts
import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export enum userRoles {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  TUTOR = "TUTOR",
}

export const auth =
  (...roles: userRoles[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const session = await betterAuth.api.getSession({
          headers: {
            cookie: req.headers.cookie || "",
            authorization: req.headers.authorization || "",
          },
        });

        if (!session) {
          return res.status(401).json({
            success: false,
            message: "You are not authorized!",
          });
        }

        if (!session.user.emailVerified) {
          return res.status(403).json({
            success: false,
            message: "Email verification required!",
          });
        }

        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            tutorProfile: {
              select: { id: true },
            },
          },
        });

        if (!dbUser) {
          return res.status(401).json({
            success: false,
            message: "User not found",
          });
        }

        req.user = {
          id: dbUser.id,
          email: session.user.email,
          name: session.user.name,
          role: dbUser.role as userRoles,
          emailVerified: session.user.emailVerified,
          tutorProfileId: dbUser.tutorProfile?.id ?? null,
        };

        if (roles.length > 0 && !roles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission!",
          });
        }

        next();
      } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error during authentication",
        });
      }
    };