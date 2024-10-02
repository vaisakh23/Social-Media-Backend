import { body, param } from "express-validator";
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

  messageId() {
    return param("messageId")
      .notEmpty()
      .withMessage("Message ID is required.")
      .isMongoId()
      .withMessage("Message ID must be a valid Mongo ID.");
  }

  sendMessageRules() {
    return validate([this.conversationId(), this.text()]);
  }

  editRules() {
    return validate([this.messageId(), this.text()]);
  }

  unsendRules() {
    return validate([this.messageId()]);
  }
}

export default MessageValidation;
