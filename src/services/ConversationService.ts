import { Types } from "mongoose";
import HttpException from "../exceptions/HttpException";
import Conversation from "../models/Conversation";
import Group from "../models/Group";
import Member from "../models/Member";
import Message from "../models/Message";
import { ConversationTypes } from "../types/ConversationType";
import { MemberRoles } from "../types/MemberType";
import { MessageTypes } from "../types/MessageType";
import UserType from "../types/UserType";
import ApiFeatures from "../utils/ApiFeatures";

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

  public async startOneToOneChat({
    senderId,
    receiverId,
    text,
  }: {
    senderId: string;
    receiverId: string;
    text: string;
  }) {
    // Ensure sender and receiver are not the same
    if (senderId === receiverId) {
      throw new HttpException(
        "Sender and receiver cannot be the same user.",
        400
      );
    }

    // Check if a one-to-one conversation already exists between these users
    let conversation = await Conversation.findOne({
      type: ConversationTypes.ONETOONE,
      members: { $all: [senderId, receiverId] }, // Ensure both users are part of the conversation
    });

    if (!conversation) {
      // If no existing conversation, create a new one
      const members = await Member.insertMany([
        { user: senderId, role: MemberRoles.MEMBER, active: true },
        { user: receiverId, role: MemberRoles.MEMBER, active: true },
      ]);

      conversation = new Conversation({
        type: ConversationTypes.ONETOONE,
        members,
      });

      await conversation.save();
    }

    // Create the first message for the conversation
    const message = new Message({
      type: MessageTypes.USER,
      conversation: conversation._id,
      sender: senderId,
      text: text,
    });

    await message.save();

    return { conversation };
  }

  public async listUserConversations(userId: string) {
    const conversations = await Conversation.aggregate([
      // Populate members with user details
      {
        $lookup: {
          from: "members", // Join with the `Member` collection
          let: { memberIds: "$members" }, // Pass the `members` array from Conversation
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$memberIds"], // Match `_id` in Member with `members` in Conversation
                },
              },
            },
            {
              $lookup: {
                from: "users",
                let: { userId: "$user" }, // Use the `user` field from `Member`
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$userId"], // Match the user ID in `User`
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      fullname: 1,
                      username: 1,
                      avatar: 1,
                    },
                  },
                ],
                as: "userDetails",
              },
            },
            {
              $addFields: {
                user: { $arrayElemAt: ["$userDetails", 0] }, // Embed the user details directly in `user`
              },
            },
            {
              $project: { userDetails: 0 },
            },
          ],
          as: "memberDetails",
        },
      },
      // *** Match conversations where the user is part of the members
      {
        $match: {
          "memberDetails.user._id": new Types.ObjectId(userId),
        },
      },
      // Fetch the last message for each conversation
      {
        $lookup: {
          from: "messages", // Join with the `Message` collection
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
          as: "lastMessage", // Output the result to the `lastMessage` field
        },
      },
      {
        $unwind: {
          path: "$lastMessage", // Unwind the `lastMessage` array
          preserveNullAndEmptyArrays: true, // Preserve conversations without messages
        },
      },
      // Update the text field for the auth user
      {
        $addFields: {
          "lastMessage.text": {
            $cond: [
              { $eq: ["$lastMessage.type", MessageTypes.SYSTEM] }, // Check if the type is 'system'
              {
                $cond: [
                  { $eq: ["$lastMessage.sender", new Types.ObjectId(userId)] }, // If sender is the user
                  "$lastMessage.systemMessageToSender", // Use systemMessageToSender
                  {
                    $cond: [
                      {
                        $eq: [
                          "$lastMessage.receiver",
                          new Types.ObjectId(userId),
                        ],
                      }, // If receiver is the user
                      "$lastMessage.systemMessageToReceiver", // Use systemMessageToReceiver
                      "$lastMessage.systemMessageToOthers", // Otherwise use systemMessageToOthers
                    ],
                  },
                ],
              },
              "$lastMessage.text", // Retain the original `text` if `type` is not 'system'
            ],
          },
        },
      },
      // Fetch group details for group conversations
      {
        $lookup: {
          from: "groups",
          localField: "group",
          foreignField: "_id",
          as: "groupDetails",
        },
      },
      {
        $unwind: {
          path: "$groupDetails", // Unwind `groupDetails`
          preserveNullAndEmptyArrays: true, // Preserve one-to-one conversations without groups
        },
      },
      // Add dynamic name and image fields
      {
        $addFields: {
          name: {
            $cond: [
              { $eq: ["$type", "group"] }, // If conversation type is group
              "$groupDetails.name", // Use group name
              {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$memberDetails", // Iterate through members
                          as: "member",
                          cond: {
                            $ne: [
                              "$$member.user._id",
                              new Types.ObjectId(userId),
                            ],
                          }, // Exclude current user's ID
                        },
                      },
                      as: "filteredMember",
                      in: "$$filteredMember.user.username", // Extract only the fullname of the filtered member
                    },
                  },
                  0, // Take the first element of the mapped array
                ],
              }, // Otherwise use the filtered member's name
            ],
          },
          image: {
            $cond: [
              { $eq: ["$type", "group"] }, // If conversation type is group
              "$groupDetails.image", // Use group image
              {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$memberDetails", // Iterate through members
                          as: "member",
                          cond: {
                            $ne: [
                              "$$member.user._id",
                              new Types.ObjectId(userId),
                            ],
                          }, // Exclude current user's ID
                        },
                      },
                      as: "filteredMember",
                      in: "$$filteredMember.user.avatar", // Extract only the avatar of the filtered member
                    },
                  },
                  0, // Take the first element of the mapped array
                ],
              }, // Otherwise use the filtered member's avatar
            ],
          },
        },
      },
      // Project specific fields
      {
        $project: {
          _id: 1,
          type: 1,
          group: "$groupDetails", // Include group details
          members: "$memberDetails", // Include members as user references
          lastMessage: "$lastMessage",
          name: 1,
          image: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    return conversations;
  }

  public async listConversationMessages(
    conversationId: string,
    userId: any,
    queryString: any
  ) {
    // Fetch the conversation to get the list of member IDs
    const conversation = await Conversation.findById(conversationId).select(
      "members"
    );

    if (
      !conversation ||
      !conversation.members ||
      conversation.members.length === 0
    ) {
      throw new HttpException("Conversation not found or has no members.", 404);
    }

    // Fetch the member details for the user in the conversation
    const member = await Member.findOne({
      user: userId,
      _id: { $in: conversation.members }, // Ensure the member is part of the conversation
    }).select("memberSince active");

    if (!member) {
      throw new HttpException(
        "User is not a member of this conversation.",
        404
      );
    }

    if (!member.active) {
      throw new HttpException(
        "You have been removed from this group.",
        403 // Forbidden status for a removed member
      );
    }

    // Fetch messages for the conversation after the `memberSince` date
    const messagesQuery = Message.find({
      conversation: conversationId,
      createdAt: { $gte: member.memberSince }, // Only messages after the member's join date
    });

    const searchFields = ["text"];
    const apiFeature = new ApiFeatures(
      messagesQuery,
      queryString,
      searchFields
    );
    const { page = 1, limit = 9 } = queryString;
    const total = await apiFeature.countDocuments();
    const messages = await apiFeature.executeQuery();
    return {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      messages,
    };
  }
}

export default ConversationService;
