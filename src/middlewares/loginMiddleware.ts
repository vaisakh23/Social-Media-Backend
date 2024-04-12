import { Request, Response, NextFunction } from "express";
import passport from "passport";
import UnauthorizedException from "../exceptions/UnauthorizedException";

export const loginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("local", (error: any, user: any) => {
    if (error) {
      next(error);
    }
    if (!user) {
      next(new UnauthorizedException());
    }
    res.locals.user = user;
    next();
  })(req, res, next);
};
