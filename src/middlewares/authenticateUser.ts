import { NextFunction, Request, Response } from "express";
import passport from "passport";
import UnauthorizedException from "../exceptions/UnauthorizedException ";

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false }, (error: any, user: any) => {
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
