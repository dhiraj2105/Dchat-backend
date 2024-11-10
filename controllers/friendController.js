import FriendRequestModel from "../models/FriendRequestModel.js";
import UserModel from "../models/UserModel.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user.id;

    // check if the sender and reciver are the same
    if (userId === senderId) {
      return res
        .status(400)
        .json({ message: "You can't send a friend request to yourself" });
    }

    //  check if the user exists
    const recevier = await UserModel.findById(userId);
    if (!recevier) return res.status(404).json({ error: "User not found" });

    // Check for exsisting friend Request
    const existingRequest = await FriendRequestModel.findOne({
      $or: [
        {
          sender: senderId,
          receiver: userId,
          status: { $in: ["pending", "accepted"] },
        },
        {
          sender: userId,
          receiver: senderId,
          status: { $in: ["pending", "accepted"] },
        },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        error: "Friend request already exsists, or you are already friends",
      });
    }

    // Create a new friend request
    const friendRequest = new FriendRequestModel({
      sender: senderId,
      receiver: userId,
    });

    await friendRequest.save();

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Send friend request error", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // find the friend request
    const friendRequest = await FriendRequestModel.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Ensure authenticated user is the reciver of the request
    if (friendRequest.receiver.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    // Update friend request status to accept
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user to other's friend list
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendRequest.sender },
    });
    await UserModel.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: userId },
    });

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Accept friend request error", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // find friend request
    const friendRequest = await FriendRequestModel.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Ensure authenticated user is the reciver of request
    if (friendRequest.receiver.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    // Removing friend request from database
    await FriendRequestModel.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request declined successfully" });
  } catch (error) {
    console.error("Decline friend request error", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const viewFriendList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user and populate their friends
    const user = await UserModel.findById(userId).populate(
      "friends",
      "username email profilePicture"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("View friend list error", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
