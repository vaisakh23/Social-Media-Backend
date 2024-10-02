import Message from "../models/Message";
import Conversation from "../models/Conversation";
import Member from "../models/Member";
import HttpException from "../exceptions/HttpException";

class MessageService {
  public async sendMessage(
    conversationId: string,
    userId: string,
    text: string
  ) {
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

    // Create and save the message
    const message = new Message({
      type: "user",
      conversation: conversationId,
      sender: userId,
      text: text,
    });

    await message.save();

    // Update conversation's last message details using updateOne
    await Conversation.updateOne(
      { _id: conversationId },
      {
        $set: {
          lastMessageDate: message.createdAt,
          lastMessageSender: userId,
          lastMessageToOthers: text,
        },
      }
    );

    return message;
  }
}

export default MessageService;
