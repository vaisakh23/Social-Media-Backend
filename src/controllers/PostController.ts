import { Request, Response } from "express";
import Controller from "../decorators/controller";
import { Delete, Get, Post, Put } from "../decorators/methods";
import { authenticateUser } from "../middlewares/authenticateUser";
import uploadMiddleware from "../middlewares/uploadMiddleware";
import CommentService from "../services/CommentService";
import PostService from "../services/PostService";
import PostType from "../types/PostType";
import ApiResponse from "../utils/ApiResponse";
import PostValidation from "../validations/PostValidation";

const postValidation = new PostValidation();

@Controller("/post", [authenticateUser])
class PostController {
  public postService = new PostService();
  public commentService = new CommentService();

  @Get("")
  public async getPosts(req: Request, res: Response) {
    const posts = await this.postService.findAllPost(req.query);
    return ApiResponse.success(res, posts, "FindAll Post", 200);
  }

  @Get("/user_posts")
  async getUserPosts(req: Request, res: Response) {
    const authUser = res.locals.user;
    const posts = await this.postService.getUserPosts(authUser, req.query);
    return ApiResponse.success(res, posts, "User Posts Retrieved", 200);
  }

  @Get("/feed")
  public async getFeed(req: Request, res: Response) {
    const authUser = res.locals.user;
    const posts = await this.postService.getFeed(authUser, req.query);
    return ApiResponse.success(res, posts, "User Feed Retrieved", 200);
  }

  @Get("/explore")
  public async getExplorePosts(req: Request, res: Response) {
    const authUser = res.locals.user;
    const posts = await this.postService.getExplorePosts(authUser, req.query);
    return ApiResponse.success(res, posts, "Explore Posts Retrieved", 200);
  }

  @Post("", [uploadMiddleware("array", "images"), postValidation.createRules()])
  public async createPost(req: Request, res: Response) {
    const postData = { ...req.body, images: req.files };
    const createdPost: PostType = await this.postService.createPost(
      postData,
      res.locals.user._id
    );
    return ApiResponse.success(res, createdPost, "Post Created", 201);
  }

  @Get("/:id", [postValidation.IdRules()])
  public async getPostById(req: Request, res: Response) {
    const postId: string = req.params.id;
    const post = await this.postService.findPostById(postId);
    return ApiResponse.success(res, post, "FindOne Post", 200);
  }

  @Put("/:id", [
    uploadMiddleware("array", "images"),
    postValidation.updateRules(),
  ])
  public async updatePost(req: Request, res: Response) {
    const authUser = res.locals.user;
    const postId: string = req.params.id;
    const postData = { ...req.body, images: req.files };
    const updatedPost = await this.postService.updatePost(
      authUser,
      postId,
      postData
    );
    return ApiResponse.success(res, updatedPost, "Post Updated", 200);
  }

  @Delete("/:id", [postValidation.IdRules()])
  public async deletePost(req: Request, res: Response) {
    const authUser = res.locals.user;
    const postId: string = req.params.id;
    const deletePost = await this.postService.deletePost(authUser, postId);
    return ApiResponse.success(res, deletePost, "Post Deleted", 200);
  }

  @Post("/:id/like", [postValidation.IdRules()])
  public async likePost(req: Request, res: Response) {
    const authUser = res.locals.user;
    const postId: string = req.params.id;
    const updatedPost = await this.postService.likePost(authUser, postId);
    return ApiResponse.success(res, updatedPost, "Post Liked", 200);
  }

  @Post("/:id/unlike", [postValidation.IdRules()])
  public async unlikePost(req: Request, res: Response) {
    const authUser = res.locals.user;
    const postId: string = req.params.id;
    const updatedPost = await this.postService.unlikePost(authUser, postId);
    return ApiResponse.success(res, updatedPost, "Post Unliked", 200);
  }

  @Get("/:id/comments", [postValidation.IdRules()])
  public async getComments(req: Request, res: Response) {
    const postId: string = req.params.id;
    const comments = await this.commentService.getComments(postId, req.query);
    return ApiResponse.success(res, comments, "Comments Retrieved", 200);
  }

  @Post("/:id/report", [postValidation.IdRules()])
  public async reportPost(req: Request, res: Response) {
    const authUser = res.locals.user;
    const postId: string = req.params.id;
    const reportedPost = await this.postService.reportPost(postId, authUser);
    return ApiResponse.success(res, reportedPost, "Post Reported", 200);
  }
}

export default PostController;
