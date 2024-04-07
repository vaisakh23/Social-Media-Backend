import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Delete, Get, Post, Put } from "../decorators/methods";
import { authenticateUser } from "../middlewares/authenticateUser";
import UserService from "../services/UserService";
import UserType from "../types/UserType";
import ApiResponse from "../utils/ApiResponse";

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

  @Post("")
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
      const userId: string = req.params.id;
      const userData = req.body;
      const updateUserData = await this.userService.updateUser(
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
      const userId: string = req.params.id;
      const deleteUserData: UserType = await this.userService.deleteUser(
        userId
      );
      return ApiResponse.success(res, deleteUserData, "deleted", 200);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
