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
}

export default ConversationService;
