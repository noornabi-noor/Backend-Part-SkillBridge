// src/middleware/auth.ts
import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../config/env.config";

export enum userRoles {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  TUTOR = "TUTOR",
}

export const auth =
  (...roles: userRoles[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        let userId: string | undefined;
        let userEmail: string | undefined;
        let userName: string | undefined;
        let userRole: userRoles | undefined;
        let emailVerified = false;

        // 1. Try Better Auth Session
        const session = await betterAuth.api.getSession({
          headers: {
            cookie: req.headers.cookie || "",
            authorization: req.headers.authorization || "",
          },
        });

        if (session) {
          userId = session.user.id;
          userEmail = session.user.email;
          userName = session.user.name;
          emailVerified = session.user.emailVerified;
        } 
        // 2. Try JWT Token as fallback
        else if (req.headers.authorization?.startsWith("Bearer ")) {
          const authHeader = req.headers.authorization;
          const token = authHeader.split(" ")[1];
          
          if (token) {
            const verified = jwtUtils.verifyToken(token, envVars.ACCESS_TOKEN_SECRET);
            
            if (verified.success && verified.data) {
              userId = verified.data.userId;
              userEmail = verified.data.email;
              userName = verified.data.name;
              userRole = verified.data.role;
              emailVerified = verified.data.emailVerified;
            }
          }
        }

        if (!userId) {
          return res.status(401).json({
            success: false,
            message: "You are not authorized!",
          });
        }

        const dbUser = await prisma.user.findUnique({
          where: { id: userId! },
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
          email: userEmail || dbUser.email,
          name: userName || dbUser.name,
          role: (userRole || dbUser.role) as userRoles,
          emailVerified: emailVerified || dbUser.emailVerified,
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