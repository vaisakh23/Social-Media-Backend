import mongoose from "mongoose";
import NotFoundException from "../exceptions/NotFoundException";
import PermissionException from "../exceptions/PermissionException";
import Comment from "../models/Comment";
import Post from "../models/Post";
import User from "../models/User";

class CommentService {
  private comment = Comment;
  private post = Post;
  private user = User;

  async addComment(
    postId: string,
    userId: string,
    postOwnerId: string,
    content: string,
    tag?: object,
    reply?: string
  ) {
    const post = await this.post.findById(postId);
    if (!post) throw new NotFoundException("Post not found");

    if (reply) {
      await this.findCommentById(reply);
    }
    const comment = await this.comment.create({
      postId,
      postOwnerId,
      content,
      tag,
      reply,
      owner: userId,
    });
    post.comments.push(comment._id);
    await post.save();
    return comment.populate("owner", "avatar username email");
  }

  private async findCommentById(commentId: string) {
    const comment = await this.comment
      .findById(commentId)
      .populate("owner likes", "avatar username email");
    if (!comment) throw new NotFoundException("Comment not found");
    return comment;
  }

  async getComments(postId: string, queryString: any) {
    const page = parseInt(queryString?.page || 1, 10);
    const limit = parseInt(queryString?.limit || 9, 10);
    const skip = (page - 1) * limit;
    const comments = await this.comment.aggregate([
      // Match comments that belong to the specified postId and are not replies
      {
        $match: { postId: new mongoose.Types.ObjectId(postId), reply: null },
      },
      { $sort: { createdAt: -1 } },
      // Lookup to find replies for each comment
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "reply",
          as: "replies",
        },
      },
      // Lookup to find the owners of the replies
      {
        $lookup: {
          from: "users",
          localField: "replies.owner",
          foreignField: "_id",
          as: "replyOwners",
        },
      },
      // Transforms the replies array to include owner information.
      {
        $addFields: {
          replies: {
            $map: {
              input: "$replies",
              as: "reply",
              in: {
                _id: "$$reply._id",
                content: "$$reply.content",
                tag: "$$reply.tag",
                reply: "$$reply.reply",
                likes: "$$reply.likes",
                postId: "$$reply.postId",
                postOwnerId: "$$reply.postOwnerId",
                createdAt: "$$reply.createdAt",
                updatedAt: "$$reply.updatedAt",
                owner: {
                  $let: {
                    vars: {
                      ownerDetails: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$replyOwners",
                              as: "replyOwner",
                              cond: {
                                $eq: ["$$replyOwner._id", "$$reply.owner"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      _id: "$$ownerDetails._id",
                      avatar: "$$ownerDetails.avatar",
                      username: "$$ownerDetails.username",
                      email: "$$ownerDetails.email",
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          __v: 0,
          "replies.__v": 0,
          replyOwners: 0,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);
    // Populate owner details for the main comments
    await this.user.populate(comments, {
      path: "owner",
      select: "avatar username email",
    });
    // Count total number of comments for pagination metadata
    const totalComments = await this.comment.countDocuments({
      postId: postId,
      reply: null,
    });
    return {
      page: page,
      limit: limit,
      total: totalComments,
      comments,
    };
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await this.findCommentById(commentId);
    this.ownerOnly(userId, comment);
    comment.content = content;
    await comment.save();
    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.findCommentById(commentId);
    this.ownerOnly(userId, comment);
    await comment.deleteOne();
    await this.post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: commentId },
    });
    return comment;
  }

  private ownerOnly(userId: any, foundComment: any) {
    if (userId.toString() !== foundComment.owner._id.toString()) {
      throw new PermissionException();
    }
  }
}

export default CommentService;
