import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Delete, Get, Post, Put } from "../decorators/methods";
import { authenticateUser } from "../middlewares/authenticateUser";
import UserService from "../services/UserService";
import UserType from "../types/UserType";
import ApiResponse from "../utils/ApiResponse";
import { admin } from "../middlewares/admin";

@Controller("/user", [authenticateUser])
class UserController {
  public userService = new UserService();

  @Get("")
  public async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const findAllUsersData: UserType[] = await this.userService.findAllUser();
      return ApiResponse.success(res, findAllUsersData, "findAll", 200);
    } catch (error) {
      next(error);
    }
  }

  @Post("", [admin])
  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: UserType = req.body;
      const createUserData: UserType = await this.userService.createUser(
        userData
      );
      return ApiResponse.success(res, createUserData, "created", 201);
    } catch (error) {
      next(error);
    }
  }

  @Get("/:id")
  public async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.id;
      const findOneUserData = await this.userService.findUserById(userId);
      return ApiResponse.success(res, findOneUserData, "findOne", 200);
    } catch (error) {
      next(error);
    }
  }

  @Put("/:id")
  public async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = res.locals.user;
      const userId: string = req.params.id;
      const userData = req.body;
      const updateUserData = await this.userService.updateUser(
        authUser,
        userId,
        userData
      );
      return ApiResponse.success(res, updateUserData, "updated", 200);
    } catch (error) {
      next(error);
    }
  }

  @Delete("/:id")
  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = res.locals.user;
      const userId: string = req.params.id;
      const deleteUserData = await this.userService.deleteUser(
        authUser,
        userId
      );
      return ApiResponse.success(res, deleteUserData, "deleted", 200);
    } catch (error) {
      next(error);
    }
  }

  @Post("/follow/:id")
  public async follow(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = res.locals.user;
      const userIdToFollow: string = req.params.id;
      const updateUserData = await this.userService.follow(
        authUser,
        userIdToFollow
      );
      return ApiResponse.success(res, updateUserData, "followed", 200);
    } catch (error) {
      next(error);
    }
  }

  @Post("/unfollow/:id")
  public async unFollow(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = res.locals.user;
      const userIdToUnFollow: string = req.params.id;
      const updateUserData = await this.userService.unFollow(
        authUser,
        userIdToUnFollow
      );
      return ApiResponse.success(res, updateUserData, "unFollowed", 200);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
