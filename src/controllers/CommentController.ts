import { Request, Response } from "express";
import Controller from "../decorators/controller";
import { Delete, Post, Put } from "../decorators/methods";
import { authenticateUser } from "../middlewares/authenticateUser";
import CommentService from "../services/CommentService";
import ApiResponse from "../utils/ApiResponse";
import CommentValidation from "../validations/CommentValidation";

const commentValidation = new CommentValidation();

@Controller("/comment", [authenticateUser])
class CommentController {
  public commentService = new CommentService();

  @Post("", [commentValidation.createRules()])
  public async addComment(req: Request, res: Response) {
    const { postId, content, tag, reply, postOwnerId } = req.body;
    const authUser = res.locals.user;
    const comment = await this.commentService.addComment(
      postId,
      authUser._id,
      postOwnerId,
      content,
      reply
    );
    return ApiResponse.success(res, comment, "Comment Added", 201);
  }

  @Put("/:commentId", [commentValidation.updateRules()])
  public async updateComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const { content } = req.body;
    const authUser = res.locals.user;
    const updatedComment = await this.commentService.updateComment(
      commentId,
      authUser._id,
      content
    );
    return ApiResponse.success(res, updatedComment, "Comment Updated", 200);
  }

  @Delete("/:commentId", [commentValidation.interactionRules()])
  public async deleteComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const authUser = res.locals.user;
    const deletedComment = await this.commentService.deleteComment(
      commentId,
      authUser._id
    );
    return ApiResponse.success(res, deletedComment, "Comment Deleted", 200);
  }

  @Post("/:commentId/like", [commentValidation.interactionRules()])
  public async likeComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const authUser = res.locals.user;
    const comment = await this.commentService.likeComment(
      commentId,
      authUser._id
    );
    return ApiResponse.success(res, comment, "Comment Liked", 200);
  }

  @Post("/:commentId/unlike", [commentValidation.interactionRules()])
  public async unlikeComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const authUser = res.locals.user;
    const comment = await this.commentService.unlikeComment(
      commentId,
      authUser._id
    );
    return ApiResponse.success(res, comment, "Comment Unliked", 200);
  }
}

export default CommentController;
