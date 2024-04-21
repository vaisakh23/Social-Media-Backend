import { Response } from "express";
import HttpException from "../exceptions/HttpException";

export default class ApiResponse {
  static success<T>(
    res: Response,
    results: T,
    message: string,
    statusCode: number
  ) {
    return res.status(statusCode).json({
      success: true,
      code: statusCode,
      message,
      data: results,
    });
  }

  static error(res: Response, error: HttpException) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.statusCode,
      error: error.errorCode,
      message: error.message,
    });
  }

  static validationFail(res: Response, errors: any[]) {
    return res.status(422).json({
      success: false,
      code: 422,
      message: "Validation error",
      errors,
    });
  }
}
