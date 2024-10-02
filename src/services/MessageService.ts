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

  public async editMessage(messageId: string, userId: string, newText: string) {
    // Find the message and check if the user is the original sender
    const message = await Message.findOne({ _id: messageId });

    if (!message) {
      throw new HttpException("Message not found", 404);
    }

    if (message.sender?.toString() !== userId.toString()) {
      throw new HttpException("You can only edit your own messages.", 403);
    }

    message.text = newText;
    message.edited = true;
    const latMessageUpdatedAT = message.updatedAt?.toISOString(); // Store last updated date before editing
    await message.save();

    const conversation = await Conversation.findOne({
      _id: message.conversation,
    });
    // Check if the edited message is the last message in the conversation
    if (
      conversation?.lastMessageSender.toString() === userId.toString() &&
      (message.createdAt?.toISOString() ===
        conversation.lastMessageDate.toISOString() ||
        latMessageUpdatedAT === conversation.lastMessageDate.toISOString()) // For repeted editing
    ) {
      // Update conversation's last message if the edited message is the last one
      await Conversation.updateOne(
        { _id: conversation._id },
        {
          $set: {
            lastMessageToOthers: newText,
            lastMessageDate: message.updatedAt,
          },
        }
      );
    }

    return message;
  }
}

export default MessageService;
