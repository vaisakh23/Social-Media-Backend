import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Delete, Get, Post, Put } from "../decorators/methods";
import { admin } from "../middlewares/admin";
import { authenticateUser } from "../middlewares/authenticateUser";
import uploadMiddleware from "../middlewares/uploadMiddleware";
import UserService from "../services/UserService";
import UserType from "../types/UserType";
import ApiResponse from "../utils/ApiResponse";
import UserValidation from "../validations/UserValidation";

const userValidation = new UserValidation();

@Controller("/user", [authenticateUser])
class UserController {
  public userService = new UserService();

  @Get("")
  public async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const findAllUsersData = await this.userService.findAllUser(req.query);
      return ApiResponse.success(res, findAllUsersData, "FindAll User", 200);
    } catch (error) {
      next(error);
    }
  }

  @Post("", [
    admin,
    uploadMiddleware("single", "avatar"),
    userValidation.createRules(),
  ])
  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: UserType = { ...req.body, avatar: req.file };
      const createUserData: UserType = await this.userService.createUser(
        userData
      );
      return ApiResponse.success(res, createUserData, "User Created", 201);
    } catch (error) {
      next(error);
    }
  }

  @Get("/:id", [userValidation.IdRules()])
  public async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.id;
      const findOneUserData = await this.userService.findUserById(userId);
      return ApiResponse.success(res, findOneUserData, "FindOne User", 200);
    } catch (error) {
      next(error);
    }
  }

  @Put("/:id", [
    uploadMiddleware("single", "avatar"),
    userValidation.updateRules(),
  ])
  public async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = res.locals.user;
      const userId: string = req.params.id;
      const userData = { ...req.body, avatar: req.file };
      const updateUserData = await this.userService.updateUser(
        authUser,
        userId,
        userData
      );
      return ApiResponse.success(res, updateUserData, "User Updated", 200);
    } catch (error) {
      next(error);
    }
  }

  @Delete("/:id", [userValidation.IdRules()])
  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = res.locals.user;
      const userId: string = req.params.id;
      const deleteUserData = await this.userService.deleteUser(
        authUser,
        userId
      );
      return ApiResponse.success(res, deleteUserData, "User Deleted", 200);
    } catch (error) {
      next(error);
    }
  }

  @Post("/follow/:id", [userValidation.IdRules()])
  public async follow(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = res.locals.user;
      const userIdToFollow: string = req.params.id;
      const updateUserData = await this.userService.follow(
        authUser,
        userIdToFollow
      );
      return ApiResponse.success(res, updateUserData, "Followed User", 200);
    } catch (error) {
      next(error);
    }
  }

  @Post("/unfollow/:id", [userValidation.IdRules()])
  public async unFollow(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = res.locals.user;
      const userIdToUnFollow: string = req.params.id;
      const updateUserData = await this.userService.unFollow(
        authUser,
        userIdToUnFollow
      );
      return ApiResponse.success(res, updateUserData, "UnFollowed User", 200);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
