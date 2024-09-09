import { body } from "express-validator";
import { validate } from "../utils/validate";

class MessageValidation {
  conversationId() {
    return body("conversationId")
      .notEmpty()
      .withMessage("Conversation ID is required.")
      .bail()
      .isMongoId()
      .withMessage("Conversation ID must be a valid Mongo ID.");
  }

  text() {
    return body("text")
      .notEmpty()
      .withMessage("Message text is required.")
      .bail()
      .isString()
      .withMessage("Message text must be a string.");
  }

  sendMessageRules() {
    return validate([this.conversationId(), this.text()]);
  }
}

export default MessageValidation;
