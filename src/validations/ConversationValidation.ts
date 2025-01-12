import { body } from "express-validator";
import { validate } from "../utils/validate";

class ConversationValidation {
  groupName() {
    return body("groupName")
      .notEmpty()
      .withMessage("Group name is required.")
      .bail()
      .isString()
      .withMessage("Group name must be a string.");
  }

  members() {
    return body("members")
      .isArray({ min: 1, max: 50 })
      .withMessage(
        "Members must be an array with at least one and at most 50 members."
      )
      .bail()
      .custom((members: string[]) => {
        if (members.some((member) => !/^[a-f\d]{24}$/i.test(member))) {
          throw new Error("Each member ID must be a valid Mongo ID.");
        }
        return true;
      });
  }

  image() {
    // Todo: can be a bug, image should be in req.file
    return body("image").isString().withMessage("Image must be a string.");
  }

  receiverId() {
    return body("receiverId")
      .notEmpty()
      .withMessage("Receiver ID is required.")
      .bail()
      .isString()
      .withMessage("Receiver ID must be a string.")
      .bail()
      .isMongoId()
      .withMessage("Receiver ID must be a valid Mongo ID.");
  }

  text() {
    return body("text")
      .notEmpty()
      .withMessage("Message text is required.")
      .bail()
      .isString()
      .withMessage("Message text must be a string.")
      .bail()
      .isLength({ max: 500 })
      .withMessage("Message text cannot exceed 500 characters.");
  }

  startGroupChatRules() {
    return validate([this.groupName(), this.members(), this.image()]);
  }

  startOneToOneChatRules() {
    return validate([this.receiverId(), this.text()]);
  }
}

export default ConversationValidation;
