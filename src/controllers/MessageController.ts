import { Request, Response } from "express";
import Controller from "../decorators/controller";
import { Post, Put } from "../decorators/methods";
import { authenticateUser } from "../middlewares/authenticateUser";
import MessageService from "../services/MessageService";
import ApiResponse from "../utils/ApiResponse";
import MessageValidation from "../validations/MessageValidation";

const messageValidation = new MessageValidation();

@Controller("/message", [authenticateUser])
class MessageController {
  public messageService = new MessageService();

  @Post("/send", [messageValidation.sendMessageRules()])
  public async sendMessage(req: Request, res: Response) {
    const { conversationId, text } = req.body;
    const authUser = res.locals.user;

    const message = await this.messageService.sendMessage(
      conversationId,
      authUser._id,
      text
    );
    return ApiResponse.success(res, message, "Message Sent", 201);
  }

  @Put("/:messageId", [messageValidation.editRules()])
  public async editMessage(req: Request, res: Response) {
    const { messageId } = req.params;
    const { text } = req.body;
    const authUser = res.locals.user;

    const updatedMessage = await this.messageService.editMessage(
      messageId,
      authUser._id,
      text
    );
    return ApiResponse.success(res, updatedMessage, "Message Updated", 200);
  }
}

export default MessageController;
