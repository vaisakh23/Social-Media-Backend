import NotFoundException from "../exceptions/NotFoundException";
import PermissionException from "../exceptions/PermissionException";
import Comment from "../models/Comment";
import Post from "../models/Post";
import UserType from "../types/UserType";
import ApiFeatures from "../utils/ApiFeatures";
import { UserRoles } from "../utils/UserRoles";

class PostService {
  private post = Post;
  private comment = Comment;

  async findAllPost(queryString: any) {
    const searchFields = ["content"];
    const apiFeature = new ApiFeatures(
      this.post.find(),
      queryString,
      searchFields
    );
    const { page = 1, limit = 9 } = queryString;
    const total = await apiFeature.countDocuments();
    const query = apiFeature.executeQuery();
    const posts = await query.populate("owner", "avatar username");
    return {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      posts,
    };
  }

  async getUserPosts(authUser: UserType, queryString: any) {
    const apiFeature = new ApiFeatures(
      this.post.find({ owner: authUser._id }),
      queryString
    );
    const { page = 1, limit = 9 } = queryString;
    const total = await apiFeature.countDocuments();
    const query = apiFeature.executeQuery();
    const posts = await query.populate("owner", "avatar username");
    return {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      posts,
    };
  }

  async getFeed(authUser: UserType, queryString: any) {
    const apiFeature = new ApiFeatures(
      this.post.find({
        owner: { $in: [authUser._id, ...(authUser?.following || [])] },
        reports: { $ne: authUser._id }, // Exclude posts reported by the authUser
      })
    );
    const { page = 1, limit = 9 } = queryString;
    const total = await apiFeature.countDocuments();
    const query = apiFeature.executeQuery();
    const posts = await query.populate("owner", "avatar username");
    return {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      posts,
    };
  }

  async createPost(postData: any, userId: string) {
    const createdPost = await this.post.create({
      ...postData,
      owner: userId,
    });
    return createdPost;
  }

  async findPostById(postId: string) {
    const findPost = await this.post
      .findOne({ _id: postId })
      .populate("owner", "avatar username");
    if (!findPost) throw new NotFoundException("Post not found");
    return findPost;
  }

  async updatePost(authUser: UserType, postId: string, postDate: any) {
    const foundPost = await this.findPostById(postId);
    this.ownerOrAdminOnly(authUser, foundPost);
    Object.assign(foundPost, postDate);
    await foundPost.save();
    return foundPost;
  }

  async deletePost(authUser: UserType, postId: string) {
    const foundPost = await this.findPostById(postId);
    this.ownerOrAdminOnly(authUser, foundPost);
    await this.comment.deleteMany({ _id: { $in: foundPost.comments } });
    await foundPost.deleteOne();
    return foundPost;
  }

  async likePost(authUser: UserType, postId: string) {
    const updatedPost = await this.post.findOneAndUpdate(
      { _id: postId },
      { $addToSet: { likes: authUser._id } },
      { new: true }
    );
    if (!updatedPost) {
      throw new NotFoundException("Post not found");
    }
    return updatedPost;
  }

  async unlikePost(authUser: UserType, postId: string) {
    const updatedPost = await this.post.findOneAndUpdate(
      { _id: postId },
      { $pull: { likes: authUser._id } },
      { new: true }
    );
    if (!updatedPost) {
      throw new NotFoundException("Post not found");
    }
    return updatedPost;
  }

  async reportPost(postId: string, authUser: UserType) {
    const report = await this.post.findOneAndUpdate(
      { _id: postId },
      { $addToSet: { reports: authUser._id } },
      { new: true }
    );
    if (!report) {
      throw new NotFoundException("Post not found");
    }
    // Delete Post if the number of reports exceeds 5
    if (report.reports.length > 5) {
      await report.deleteOne();
      await this.comment.deleteMany({ _id: { $in: report.comments } });
    }
    return report;
  }

  ownerOrAdminOnly(authUser: UserType, foundPost: any) {
    if (
      authUser.role != UserRoles.ADMIN &&
      authUser._id != foundPost.owner._id
    ) {
      throw new PermissionException();
    }
  }
}

export default PostService;
