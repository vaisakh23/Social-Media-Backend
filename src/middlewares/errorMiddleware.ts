import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/HttpException";
import ApiResponse from "../utils/ApiResponse";
import logger from "../utils/logger";

const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status: number = error.statusCode || 500;
    const message: string = error.message;

    if (!(error instanceof HttpException)) {
      logger.error(
        `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}, Error:: ${error}`
      );
      error = new HttpException("Internal server error", 500);
    }
    return ApiResponse.error(res, error)
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
