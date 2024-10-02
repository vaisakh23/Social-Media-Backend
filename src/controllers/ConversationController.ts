import { Request, Response } from "express";
import Controller from "../decorators/controller";
import { Post } from "../decorators/methods";
import { authenticateUser } from "../middlewares/authenticateUser";
import ConversationService from "../services/ConversationService";
import ApiResponse from "../utils/ApiResponse";
import ConversationValidation from "../validations/ConversationValidation";
import uploadMiddleware from "../middlewares/uploadMiddleware";

const conversationValidation = new ConversationValidation();

@Controller("/conversations", [authenticateUser])
class ConversationController {
  public conversationService = new ConversationService();

  @Post("/start-group-chat", [
    uploadMiddleware("single", "image"),
    conversationValidation.startGroupChatRules(),
  ])
  public async startGroupChat(req: Request, res: Response) {
    const { groupName, members, image } = req.body;
    const authUser = res.locals.user;

    const { conversation } = await this.conversationService.startGroupChat({
      authUser,
      groupName,
      members,
      groupImage: image,
    });

    return ApiResponse.success(
      res,
      conversation,
      "Group chat started successfully.",
      201
    );
  }
}

export default ConversationController;
