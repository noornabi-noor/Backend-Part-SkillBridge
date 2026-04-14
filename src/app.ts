import express, { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { indexRoutes } from "./app/routes";
import { auth } from "./app/lib/auth";
import errorHandler from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { envVars } from "./app/config/env.config";
import qs from "qs";
import path from "path";

const app = express();
app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), 'src/app/templates'));

const allowedOrigins = [
  envVars.APP_URL || "http://localhost:3000",
  envVars.PROD_APP_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
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

// better-auth MUST be mounted BEFORE express.json() — it reads the raw body stream
app.all("/api/auth/{*any}", toNodeHandler(auth));

// JSON / body parsers come AFTER better-auth handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", indexRoutes);

app.use(errorHandler);
app.use(notFound);

app.get("", (req: Request, res: Response) => {
  res.send("Hello world!");
});

export default app;