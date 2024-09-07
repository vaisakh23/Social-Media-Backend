import Conversation from "../models/Conversation";
import Group from "../models/Group";
import Member from "../models/Member";
import Message from "../models/Message";
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
      role: "member",
      active: true,
    }));
    if (membersObj) groupMembers.push(...membersObj);
    groupMembers.push({
      user: authUser.id,
      role: "admin",
      active: true,
    });

    const insertedMembers = await Member.insertMany(groupMembers);

    const conversation = new Conversation({
      type: "group",
      group: group._id,
      members: insertedMembers,
      lastMessageDate: new Date(),
      lastMessageSender: authUser.id,
      lastMessageToOthers: `Group created by ${authUser.username}`, // Todo - instead get latest Message stored in frontend
      lastMessageToSender: "Group created by you",
    });

    await conversation.save();

    const message = new Message({
      type: "system",
      conversation: conversation._id,
      sender: authUser.id,
      systemMessageToOthers: `Group created by ${authUser.username}`,
      systemMessageToSender: "Group created by you",
    });

    await message.save();

    return { conversation, message };
  }
}

export default ConversationService;
