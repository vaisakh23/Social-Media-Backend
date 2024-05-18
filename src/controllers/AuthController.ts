import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Post } from "../decorators/methods";
import { loginMiddleware } from "../middlewares/loginMiddleware";
import uploadMiddleware from "../middlewares/uploadMiddleware";
import AuthService from "../services/AuthService";
import ApiResponse from "../utils/ApiResponse";
import UserValidation from "../validations/UserValidation";

const userValidation = new UserValidation();

@Controller("/auth")
class AuthController {
  public authService = new AuthService();

  @Post("/login", [userValidation.loginRules(), loginMiddleware])
  async login(req: Request, res: Response, next: NextFunction) {
    const userDate = res.locals.user;
    const accessData = await this.authService.login(userDate);
    return ApiResponse.success(res, accessData, "User Login", 200);
  }

  @Post("/signup", [
    uploadMiddleware("single", "avatar"),
    userValidation.createRules(),
  ])
  async signup(req: Request, res: Response, next: NextFunction) {
    const userDate = { ...req.body, avatar: req.file };
    const accessData = await this.authService.signup(userDate);
    return ApiResponse.success(res, accessData, "User Signup", 200);
  }

  @Post("/refresh-token", [userValidation.refreshTokenRules()])
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.body.refreshToken;
    const accessData = await this.authService.refreshToken(refreshToken);
    return ApiResponse.success(res, accessData, "User RefreshToken", 200);
  }
}

export default AuthController;
