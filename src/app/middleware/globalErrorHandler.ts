import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../../generated/prisma/client";
import AppError from "../errorHelpers/appError";

interface ErrorResponse {
  success: boolean;
  message: string;
  error?: any;
  stack?: string;
}

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let errorMessage = "Inter server error!!";
  let errorDetails = err;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  }

  // PrismaClientKnownRequestError
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2000':
        statusCode = 400;
        errorMessage = 'The provided value is too long for the column type.';
        break;
      case 'P2001':
        statusCode = 404;
        errorMessage = 'The record searched for in the where condition does not exist.';
        break;
      case 'P2002':
        statusCode = 409;
        errorMessage = `Unique constraint failed on the ${err.meta?.target || 'constraint'}.`;
        errorDetails = { field: err.meta?.target };
        break;
      case 'P2003':
        statusCode = 409;
        errorMessage = 'Foreign key constraint failed.';
        errorDetails = { field: err.meta?.field_name };
        break;
      case 'P2004':
        statusCode = 400;
        errorMessage = 'A constraint failed on the database.';
        break;
      case 'P2005':
        statusCode = 400;
        errorMessage = `The value stored in the database is invalid for the field type.`;
        break;
      case 'P2006':
        statusCode = 400;
        errorMessage = 'The provided value is not valid.';
        break;
      case 'P2007':
        statusCode = 400;
        errorMessage = 'Data validation error.';
        break;
      case 'P2008':
        statusCode = 400;
        errorMessage = 'Failed to parse the query.';
        break;
      case 'P2009':
        statusCode = 400;
        errorMessage = 'Failed to validate the query.';
        break;
      case 'P2010':
        statusCode = 400;
        errorMessage = 'Raw query failed.';
        break;
      case 'P2011':
        statusCode = 400;
        errorMessage = 'Null constraint violation.';
        break;
      case 'P2012':
        statusCode = 400;
        errorMessage = 'Missing a required value.';
        break;
      case 'P2013':
        statusCode = 400;
        errorMessage = 'Missing a required argument.';
        break;
      case 'P2014':
        statusCode = 409;
        errorMessage = 'A required relation would be violated.';
        break;
      case 'P2015':
        statusCode = 404;
        errorMessage = 'A related record could not be found.';
        break;
      case 'P2016':
        statusCode = 400;
        errorMessage = 'Query interpretation error.';
        break;
      case 'P2017':
        statusCode = 400;
        errorMessage = 'The records for relation are not connected.';
        break;
      case 'P2018':
        statusCode = 404;
        errorMessage = 'The required connected records were not found.';
        break;
      case 'P2019':
        statusCode = 400;
        errorMessage = 'Input error.';
        break;
      case 'P2020':
        statusCode = 400;
        errorMessage = 'Value out of range for the type.';
        break;
      case 'P2021':
        statusCode = 500;
        errorMessage = 'The table does not exist in the current database.';
        break;
      case 'P2022':
        statusCode = 500;
        errorMessage = 'The column does not exist in the current database.';
        break;
      case 'P2023':
        statusCode = 500;
        errorMessage = 'Inconsistent column data.';
        break;
      case 'P2024':
        statusCode = 408;
        errorMessage = 'Connection pool timeout.';
        break;
      case 'P2026':
        statusCode = 400;
        errorMessage = "Current database provider doesn't support this feature.";
        break;
      case 'P2027':
        statusCode = 500;
        errorMessage = 'Multiple errors occurred during query execution.';
        break;
      case 'P2030':
        statusCode = 400;
        errorMessage = 'Cannot find a fulltext index to use for the search.';
        break;
      case 'P2033':
        statusCode = 400;
        errorMessage = 'A number used in the query does not fit into a 64-bit signed integer.';
        break;
      case 'P2034':
        statusCode = 409;
        errorMessage = 'Transaction failed due to a write conflict or deadlock.';
        break;
      case 'P2035':
        statusCode = 500;
        errorMessage = 'Assertion violation.';
        break;
      case 'P2037':
        statusCode = 503;
        errorMessage = 'Too many database connections opened.';
        break;
      default:
        statusCode = 400;
        errorMessage = `Database error: ${err.code}`;
    }

    errorDetails = {
      ...errorDetails,
      code: err.code,
      meta: err.meta,
    };
  }

  // PrismaClientUnknownRequestError
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 400;
    errorMessage = 'Database error: Invalid query or operation.';
    errorDetails = { message: err.message };
  }

  // PrismaClientRustPanicError
  else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    errorMessage = 'Database engine crashed. Please try again later.';
    errorDetails = { message: err.message };
  }

  // PrismaClientInitializationError
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    errorMessage = 'Failed to initialize database connection.';
    errorDetails = {
      errorCode: err.errorCode,
      message: err.message
    };
  }

  // PrismaClientValidationError
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = 'Validation error in database query.';
    errorDetails = { message: err.message };
  }

  // SyntaxError (JSON parsing, etc.)
  else if (err instanceof SyntaxError) {
    statusCode = 400;
    errorMessage = 'Invalid JSON syntax in request.';
  }

  // TypeError
  else if (err instanceof TypeError) {
    statusCode = 400;
    errorMessage = 'Type error occurred.';
  }

  // Custom Error Classes (extend as needed)
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorMessage = 'Unauthorized access.';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorMessage = 'Access forbidden.';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorMessage = 'Resource not found.';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    errorMessage = 'Resource conflict occurred.';
  }

  res.status(statusCode);
  res.json({
    message: errorMessage,
    error: errorDetails,
  });
}

export default errorHandler;
