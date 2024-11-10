import Conversation from "../models/Conversation";
import Group from "../models/Group";
import Member from "../models/Member";
import Message from "../models/Message";
import { ConversationTypes } from "../types/ConversationType";
import { MemberRoles } from "../types/MemberType";
import { MessageTypes } from "../types/MessageType";
import UserType from "../types/UserType";

class ConversationService {
  public async startGroupChat({
    authUser,
    groupName,
    groupImage,
    members,
  }: {
    authUser: UserType;
    groupName: string;
    members: string[];
    groupImage: string;
  }) {
    const group = new Group({
      name: groupName,
      image: groupImage,
      createdBy: authUser.id,
    });

    await group.save();

    let groupMembers = [];
    const membersObj = members?.map((memberId: string) => ({
      user: memberId,
      role: MemberRoles.MEMBER,
      active: true,
    }));
    if (membersObj) groupMembers.push(...membersObj);
    groupMembers.push({
      user: authUser.id,
      role: MemberRoles.ADMIN,
      active: true,
    });

    const insertedMembers = await Member.insertMany(groupMembers);

    const conversation = new Conversation({
      type: ConversationTypes.GROUP,
      group: group._id,
      members: insertedMembers,
    });

    await conversation.save();

    const message = new Message({
      type: MessageTypes.SYSTEM,
      conversation: conversation._id,
      sender: authUser.id,
      systemMessageToOthers: `Group created by ${authUser.username}`,
      systemMessageToSender: "Group created by you",
    });

    await message.save();

    return { conversation };
  }

  public async listUserConversations(userId: string) {
    const conversations = await Conversation.aggregate([
      {
        $match: {
          members: userId, // Match conversations where the user is a member
        },
      },
      {
        $lookup: {
          from: "messages", // Join with the 'Message' collection
          let: { conversationId: "$_id" }, // Define the conversation ID
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$conversation", "$$conversationId"], // Match messages for the current conversation
                },
              },
            },
            { $sort: { createdAt: -1 } }, // Sort messages by creation time (latest first)
            { $limit: 1 }, // Limit to the most recent message
          ],
          as: "lastMessage", // Output the result to 'lastMessage' field
        },
      },
      {
        $unwind: {
          path: "$lastMessage", // Unwind the last message array to a single object
          preserveNullAndEmptyArrays: true, // Preserve conversations without messages
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "group",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $unwind: {
          path: "$group", // Unwind group info if it's a group conversation
          preserveNullAndEmptyArrays: true, // Preserve one-to-one conversations without a group
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members", // Populate members' details
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          group: { name: 1, image: 1 }, // Project group details
          members: { _id: 1, username: 1 }, // Only return members' usernames
          lastMessage: {
            _id: 1,
            text: 1,
            sender: 1,
            createdAt: 1,
            systemMessageToOthers: 1, // Include system messages if applicable
          },
        },
      },
    ]);

    return conversations;
  }
}

export default ConversationService;
