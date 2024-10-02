import HttpException from "../exceptions/HttpException";
import Conversation from "../models/Conversation";
import Member from "../models/Member";
import Message from "../models/Message";
import { MessageTypes } from "../types/MessageType";

class MessageService {
  public async sendMessage(
    conversationId: string,
    userId: string,
    text: string
  ) {
    await this.checkConversationExists(conversationId, userId);

    // Create and save the message
    const message = new Message({
      type: MessageTypes.USER,
      conversation: conversationId,
      sender: userId,
      text: text,
    });
    await message.save();
    return message;
  }

  public async editMessage(messageId: string, userId: string, newText: string) {
    // Find the message and check if the user is the original sender
    const message = await Message.findOne({ _id: messageId });

    if (!message) {
      throw new HttpException("Message not found", 404);
    }

    if (message.sender?.toString() !== userId.toString()) {
      throw new HttpException("You can only edit your own messages.", 403);
    }
    await this.checkConversationExists(message.conversation, userId);
    message.text = newText;
    message.edited = true;
    await message.save();
    return message;
  }

  public async unsendMessage(messageId: string, userId: string) {
    const message = await Message.findOne({ _id: messageId });

    if (!message) {
      throw new HttpException("Message not found", 404);
    }

    if (message.sender?.toString() !== userId.toString()) {
      throw new HttpException("You can only unsend your own messages", 403);
    }
    await this.checkConversationExists(message.conversation, userId);
    return await Message.deleteOne({ _id: messageId });
  }

  public async replyToMessage() {} // TODO

  public async reactToMessage() {} // TODO

  private async checkConversationExists(conversationId: any, userId: string) {
    // Check if the conversation exists and if the user is an active member
    const conversation = await Conversation.findOne({
      _id: conversationId,
    }).populate({
      path: "members",
      match: { active: true, user: userId }, // Check if the member is active
      model: Member,
    });

    if (!conversation) {
      throw new HttpException(
        "Conversation not found or you are not an active member.",
        402
      );
    }
    return conversation;
  }
}

export default MessageService;
