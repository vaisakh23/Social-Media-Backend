import { body, param, query, oneOf } from "express-validator";
import { validate } from "../utils/validate";

class PostValidation {
  content() {
    return body("content")
      .notEmpty()
      .withMessage("Content cannot be empty if provided.");
  }

  images() {
    return body().custom((value, { req }) => {
      if (!req.files) {
        throw new Error("You can upload a maximum of 10 images.");
      }
      if (req.files && req.files.length > 10) {
        throw new Error("You can upload a maximum of 10 images.");
      }
      return true;
    });
  }

  id() {
    return param("id").isMongoId().withMessage("Invalid post ID format.");
  }

  ensureContentOrImages() {
    return oneOf([this.content(), this.images()], {
      message: "Either content or images must be provided.",
    });
  }

  createRules() {
    return validate([this.ensureContentOrImages()]);
  }

  updateRules() {
    return validate([
      this.id(),
      this.content().optional(),
      body().custom((value, { req }) => {
        if (req.files && req.files.length > 10) {
          throw new Error("You can upload a maximum of 10 images.");
        }
        return true;
      }),
    ]);
  }

  IdRules() {
    return validate([this.id()]);
  }
}

export default PostValidation;
