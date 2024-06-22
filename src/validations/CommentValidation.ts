import { body, param } from "express-validator";
import { validate } from "../utils/validate";

class CommentValidation {
  content() {
    return body("content")
      .notEmpty()
      .withMessage("Content is required.")
      .bail()
      .isString()
      .withMessage("Content must be a string.");
  }

  postId() {
    return body("postId")
      .notEmpty()
      .withMessage("Post ID is required.")
      .bail()
      .isMongoId()
      .withMessage("Post ID must be a valid Mongo ID.");
  }

  postOwnerId() {
    return body("postOwnerId")
      .notEmpty()
      .withMessage("Post Owner ID is required.")
      .bail()
      .isMongoId()
      .withMessage("Post Owner ID must be a valid Mongo ID.");
  }

  reply() {
    return body("reply")
      .optional()
      .isMongoId()
      .withMessage("Reply must be a valid Mongo ID.");
  }

  commentId() {
    return param("commentId")
      .notEmpty()
      .withMessage("Comment ID is required.")
      .bail()
      .isMongoId()
      .withMessage("Comment ID must be a valid Mongo ID.");
  }

  // Create Comment Rules
  createRules() {
    return validate([
      this.content(),
      this.postId(),
      this.postOwnerId(),
      this.reply().optional(),
    ]);
  }

  // Update Comment Rules
  updateRules() {
    return validate([
      this.commentId(),
      this.content(),
    ]);
  }

  // Like/Unlike/Delete Comment Rules
  interactionRules() {
    return validate([this.commentId()]);
  }
}

export default CommentValidation;
