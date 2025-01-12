import { Request, Response } from "express";
import Controller from "../decorators/controller";
import { Get, Post } from "../decorators/methods";
import { authenticateUser } from "../middlewares/authenticateUser";
import uploadMiddleware from "../middlewares/uploadMiddleware";
import ConversationService from "../services/ConversationService";
import ApiResponse from "../utils/ApiResponse";
import ConversationValidation from "../validations/ConversationValidation";

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

  @Post("/start-onetoone-chat", [
    conversationValidation.startOneToOneChatRules(),
  ])
  public async startOneToOneChat(req: Request, res: Response) {
    const { receiverId, text } = req.body;
    const authUser = res.locals.user;

    const { conversation } = await this.conversationService.startOneToOneChat({
      senderId: authUser.id,
      receiverId,
      text,
    });

    return ApiResponse.success(
      res,
      conversation,
      "Onetoone chat started successfully.",
      201
    );
  }

  @Get("/")
  public async listConversations(req: Request, res: Response) {
    const authUser = res.locals.user;

    const conversations = await this.conversationService.listUserConversations(
      authUser.id
    );

    return ApiResponse.success(
      res,
      conversations,
      "Conversations retrieved successfully.",
      200
    );
  }

  @Get("/:conversationId/messages")
  public async listConversationMessages(req: Request, res: Response) {
    const { conversationId } = req.params;
    const authUser = res.locals.user;

    const messages = await this.conversationService.listConversationMessages(
      conversationId,
      authUser.id,
      req.query
    );

    return ApiResponse.success(
      res,
      messages,
      "Messages for the conversation retrieved successfully.",
      200
    );
  }
}

export default ConversationController;
