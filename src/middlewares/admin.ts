import { NextFunction, Request, Response } from "express";
import passport from "passport";
import PermissionException from "../exceptions/PermissionException";
import { UserRoles } from "../utils/UserRoles";

export const admin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (error: any, user: any) => {
    if (error) {
      next(error);
    }
    if (!user || user.role != UserRoles.ADMIN) {
      next(new PermissionException("Admin only access"));
    }
    res.locals.user = user;
    next();
  })(req, res, next);
};
