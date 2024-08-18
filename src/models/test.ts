// conversation
{
  type: "onetoone or group";
  members: ["reference - members"];
  group: "reference - group";

  lastMessageDate: "";
  lastMessage: "";
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
  systemMessageToSender: "";
  systemMessageToReciever: "";
  timeStamp: "";
}
