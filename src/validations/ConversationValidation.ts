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

  startGroupChatRules() {
    return validate([this.groupName(), this.members(), this.image()]);
  }
}

export default ConversationValidation;
