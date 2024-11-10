// conversation
{
  type: "onetoone or group";
  members: ["reference - members"];
  group: "reference - group";

  lastMessageDate: "";
  lastMessageSender: "reference - user"
  // lastMessageToOthers: "";
  // lastMessageToSender: "";
  lastMessage: "reference - message" // Todo
  // conditional fields
  name: "";
  image: "";

  // conditional fields end

  timeStamp: "";
}

// group
{
  name: "";
  image: "";
  createdBy: "";
  timeStamp: "";
}

// members
{
  user: "reference to user table";
  role: "admin or member";
  memberSince: "date";
  active: "when removed form group false else true";
}

// messages
{
  type: "user or system";
  conversation: "refrence - conversation";
  sender: "reference - user";
  text: "";
  media: "";
  reciver: "reference - user";
  systemMessageToOthers: "";
  systemMessageToSender: "";  // Tode - write the logic to show wich msg to auth user in backend itself, just update it when returning object from api
  systemMessageToReciever: "";
  timeStamp: "";
}
// TODO
// api to get coversations of a user with last message loaded
// api to get messages of a converstion - get based on the member since date
// one to one chat
// Todo - message send , read field  - blue tick
/* Todo - when member get removed from group show only 'you been removed from grop' in frontend 
- user can remove the chat then */



// Imaginations
// punch on message to break it , make it ice blowing - reacting to a message
