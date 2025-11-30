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

	@Post("/signup", [
		uploadMiddleware("single", "avatar"),
		userValidation.createRules(),
	])
	async signup(req: Request, res: Response) {
		const userData = { ...req.body, avatar: req.file };
		const reqInfo = this.getReqInfo(req);

		const accessData = await this.authService.signup(userData, reqInfo);

		return ApiResponse.success(res, accessData, "User Signup", 200);
	}

	@Post("/login", [userValidation.loginRules(), loginMiddleware])
	async login(req: Request, res: Response) {
		const userData = res.locals.user;
		const reqInfo = this.getReqInfo(req);

		const accessData = await this.authService.login(userData, reqInfo);

		return ApiResponse.success(res, accessData, "User Login", 200);
	}

	@Post("/session-refresh", [userValidation.refreshTokenRules()])
	async refreshToken(req: Request, res: Response) {
		const refreshToken = req.body.refreshToken;

		const accessData = await this.authService.refreshToken(refreshToken);

		return ApiResponse.success(res, accessData, "Session refreshed", 200);
	}

	@Post("/logout", [userValidation.refreshTokenRules()])
	async logout(req: Request, res: Response) {
		const refreshToken = req.body.refreshToken;

		await this.authService.logout(refreshToken);

		return ApiResponse.success(res, null, "Logged out successfully", 200);
	}

	// **Extract request metadata used to identify a device session**
	private getReqInfo(req: Request) {
		return {
			ip: req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.ip,
			userAgent: req.headers["user-agent"] || "",
			deviceName: req.headers["x-device-name"] || "Unknown Device",
		};
	}
}

export default AuthController;
