import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../shared/catchAsync";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateRequest = (schema: any) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });
    next();
  });
};
