import { NextFunction, Request, Response } from "express";
import { ContextRunner, validationResult } from "express-validator";
import ApiResponse from "./ApiResponse";

export const validate = (validations: ContextRunner[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      // if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return ApiResponse.validationFail(res, errors.array());
  };
};
