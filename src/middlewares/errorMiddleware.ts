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

    logger.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}, Error:: ${error}`
    );

    if (!(error instanceof HttpException)) {
      error = new HttpException("Internal server error", 500);
    }
    return res.status(status).json(ApiResponse.error(error));
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
