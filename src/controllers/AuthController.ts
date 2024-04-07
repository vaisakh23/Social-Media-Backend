import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Post } from "../decorators/methods";
import { loginMiddleware } from "../middlewares/loginMiddleware";
import AuthService from "../services/AuthService";
import ApiResponse from "../utils/ApiResponse";

@Controller("/auth")
class AuthController {
  public authService = new AuthService();

  @Post("/login", [loginMiddleware])
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const userDate = res.locals.user;
      const accessData = await this.authService.login(userDate);
      return ApiResponse.success(res, accessData, "login", 200);
    } catch (error) {
      next(error);
    }
  }

  @Post("/signup")
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const userDate = req.body;
      const accessData = await this.authService.signup(userDate);
      return ApiResponse.success(res, accessData, "signup", 200);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
