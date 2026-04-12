import express, { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { indexRoutes } from "./app/routes";
import { auth } from "./app/lib/auth";
import errorHandler from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { envVars } from "./app/config/env.config";

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  envVars.APP_URL || "http://localhost:3000",
  envVars.PROD_APP_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// better auth 
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/v1", indexRoutes);

// global error handler
app.use(errorHandler);
// not found
app.use(notFound);

app.get("", (req: Request, res: Response) => {
  res.send("Hello world!");
});

export default app;