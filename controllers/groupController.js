import CommentModel from "../models/CommentModel.js";
import GroupPostModel from "../models/GroupPostModel.js";
import GroupSchema from "../models/GroupSchema.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, privacy } = req.body;
    const userId = req.user.id;

    if (!name || !description || !privacy) {
      return res.status(400).json({ message: "name, description,privacy ???" });
    }

    const newGroup = new GroupSchema({
      name,
      description,
      privacy,
      createdBy: userId,
      members: [userId],
      admin: userId,
    });

    await newGroup.save();

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error createing group -> ", error.message);
    res.status(500).json({ message: "Error creating group" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // find group by id
    const group = await GroupSchema.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // check if user is already member
    if (group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are already a member of this group" });
    }

    if (group.privacy === "public") {
      group.members.push(userId);
      await group.save();
      res.status(200).json({ message: "You have joined the group" });
    } else {
      if (group.joinRequests.includes(userId)) {
        return res
          .status(400)
          .json({ message: "You have already sent a join request" });
      }

      group.joinRequests.push(userId);
      await group.save();
      res.status(200).json({ message: "Join request sent" });
    }
  } catch (error) {
    console.error("Error joining group -> ", error.message);
    res.status(500).json({ message: "Error joining group" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // find group by id
    const group = await GroupSchema.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // check if the user is a member of the group
    if (!group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }

    // remove user from members list
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    // if the user is the only member or the creater, delete the group
    if (group.members.length === 0 || group.createdBy.toString() === userId) {
      await GroupSchema.findByIdAndDelete(groupId);
      return res
        .status(200)
        .json({ message: "You left the group, and it has been deleted" });
    }

    await group.save();
    res.status(200).json({ message: "You left the group" });
  } catch (error) {
    console.error("Error leaving group -> ", error.message);
    res.status(500).json({ message: "Error leaving group" });
  }
};

export const createGroupPost = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, media } = req.body;
    const userId = req.user.id;

    const group = await GroupSchema.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }

    const groupPost = await GroupPostModel.create({
      group: groupId,
      author: userId,
      content,
      media,
    });

    await GroupSchema.findByIdAndUpdate(groupId, {
      $push: { posts: groupPost._id },
    });

    await groupPost.save();
    res.status(201).json(groupPost);
  } catch (error) {
    console.error("Error creating group post -> ", error);
    res.status(500).json({ message: "Error creating group post" });
  }
};

export const likeGroupPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Find the group post
    const post = await GroupPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Like Group Post Error:", error.message);
    res.status(500).json({ error: "Failed to like post" });
  }
};

export const commentOnGroupPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Find the group post
    const post = await GroupPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Create a new comment
    const comment = await CommentModel.create({
      user: userId,
      content,
      post: postId,
    });

    // Add comment ID to the post's comments array
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.error("Comment on Group Post Error:", error.message);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

export const viewGroupPosts = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await GroupSchema.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    if (!group.members.includes(userId)) {
      return res
        .status(403)
        .json({ error: "You must be a member of this group to view posts" });
    }

    //Retrive all posts fro the specified group
    const posts = await GroupPostModel.find({ group: groupId })
      .populate("author", "name profilePicture")
      .populate("likes", "name")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name profilePicture" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error viewing group posts -> ", error);
    res.status(500).json({ message: "Error viewing group posts" });
  }
};

export const getGroupPostDetails = async (req, res) => {
  try {
    const { groupId, postId } = req.params;
    const userId = req.user.id;

    // Check if the group exists
    const group = await GroupSchema.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user is a member of the group
    if (!group.members.includes(userId)) {
      return res
        .status(403)
        .json({ error: "You must be a member of this group to view the post" });
    }

    // Find the specific post by ID
    const post = await GroupPostModel.findOne({ _id: postId, group: groupId })
      .populate("author", "name profilePicture") // Populate the author's name and profile picture
      .populate("likes", "name") // Populate likes with users' names
      .populate({
        path: "comments",
        populate: { path: "user", select: "name profilePicture" }, // Populate comment authors
      });

    if (!post) {
      return res.status(404).json({ error: "Post not found in this group" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Get Group Post Details Error:", error.message);
    res.status(500).json({ error: "Failed to retrieve post details" });
  }
};

export const editGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, rules } = req.body;
    const userId = req.user.id;

    // Check if the group exists
    const group = await GroupSchema.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user is an admin of the group
    if (group.admin.toString() !== userId) {
      return res.status(403).json({ error: "Only admins can edit the group" });
    }

    // Update group details
    if (name) group.name = name;
    if (description) group.description = description;
    if (rules) group.rules = rules;

    await group.save();

    res
      .status(200)
      .json({ message: "Group details updated successfully", group });
  } catch (error) {
    console.error("Edit Group Error:", error.message);
    res.status(500).json({ error: "Failed to update group details" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if the group exists
    const group = await GroupSchema.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user is the admin of the group
    if (group.admin.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Only admins can delete the group" });
    }

    // Delete all posts associated with the group
    await GroupPostModel.deleteMany({ group: groupId });

    // Delete the group itself
    await group.deleteOne();

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete Group Error:", error.message);
    res.status(500).json({ error: "Failed to delete group" });
  }
};

export const listAllGroups = async (req, res) => {
  try {
    // Retrieve all groups with specific fields
    const groups = await GroupSchema.find({}, "name description members")
      .populate("members", "_id") // Only populate member IDs to count them
      .lean();

    // Format the data to include member count
    const formattedGroups = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      description: group.description,
      memberCount: group.members.length,
    }));

    res.status(200).json(formattedGroups);
  } catch (error) {
    console.error("List All Groups Error:", error.message);
    res.status(500).json({ error: "Failed to retrieve groups" });
  }
};

export const viewGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Retrieve the group with full details and populated fields
    const group = await GroupSchema.findById(groupId)
      .populate("admin", "username")
      .populate("members", "username")
      .populate({
        path: "posts",
        select: "content media createdAt",
        populate: { path: "author", select: "username" },
      });

    // Check if group exists
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Send group details in response
    res.status(200).json(group);
  } catch (error) {
    console.error("View Group Details Error:", error.message);
    res.status(500).json({ error: "Failed to retrieve group details" });
  }
};
