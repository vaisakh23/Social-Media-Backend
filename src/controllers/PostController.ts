import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Get, Post, Put } from "../decorators/methods";
import { authenticateUser } from "../middlewares/authenticateUser";
import uploadMiddleware from "../middlewares/uploadMiddleware";
import PostService from "../services/PostService";
import PostType from "../types/PostType";
import ApiResponse from "../utils/ApiResponse";

@Controller("/post", [authenticateUser])
class PostController {
  public postService = new PostService();

  @Get("")
  public async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await this.postService.findAllPost(req.query);
      return ApiResponse.success(res, posts, "findAll", 200);
    } catch (error) {
      next(error);
    }
  }

  @Post("", [uploadMiddleware("array", "images")])
  public async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const postData = { ...req.body, images: req.files };
      const createdPost: PostType = await this.postService.createPost(
        postData,
        res.locals.user._id
      );
      return ApiResponse.success(res, createdPost, "created", 201);
    } catch (error) {
      next(error);
    }
  }

  @Get("/:id", [])
  public async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const postId: string = req.params.id;
      const post = await this.postService.findPostById(postId);
      return ApiResponse.success(res, post, "findOne", 200);
    } catch (error) {
      next(error);
    }
  }

  @Put("/:id", [uploadMiddleware("array", "images")])
  public async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = res.locals.user;
      const postId: string = req.params.id;
      const postData = { ...req.body, images: req.files };
      const updatedPost = await this.postService.updatePost(
        authUser,
        postId,
        postData
      );
      return ApiResponse.success(res, updatedPost, "updated", 200);
    } catch (error) {
      next(error);
    }
  }
}

export default PostController;
