import ChatModel from "../models/ChatModel.js";

export const createOneOnOneChat = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user.id;

    const exsisintgChat = await ChatModel.findOne({
      members: { $all: [userId, otherUserId] },
      type: "one-on-one",
    });

    if (exsisintgChat)
      return res
        .status(200)
        .json({ message: "Chat already exsists", exsisintgChat });

    const newChat = await ChatModel.create({
      members: [userId, otherUserId],
      type: "one-on-one",
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create 1-1 chat" });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    const { groupName, members } = req.body;
    const userId = req.user.id;

    if (!members.includes(userId)) members.push(userId);

    const newChat = await ChatModel.create({
      members,
      type: "group",
      groupName,
      admin: userId,
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create group chat" });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await ChatModel.find({ members: userId }).populate(
      "members",
      "username email"
    );
    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};
