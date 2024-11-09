import CommentModel from "../models/CommentModel.js";
import PostModel from "../models/PostModel.js";

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, media } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User authentication failed" });
    }
    const post = await PostModel.create({
      content,
      media,
      user: req.user.id,
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({ message: "Failed to create post" });
  }
};

// get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("user", "name")
      .sort({ createdAt: -1 }); // sort by date
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to get posts" });
  }
};

// Get post details
export const getPostDetails = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId)
      .populate("user", "name")
      .populate("comments");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to get post details" });
  }
};

// Edit post
export const editPost = async (req, res) => {
  const { content, media } = req.body;
  try {
    const post = await PostModel.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Unauthorized" });

    post.content = content || post.content;
    post.media = media || post.media;

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to edit post" });
  }
};

// Add Comment to Post
export const addComment = async (req, res) => {
  const { content } = req.body;
  try {
    const comment = new CommentModel({
      user: req.user.id,
      post: req.params.postId,
      content,
    });

    await comment.save();

    const post = await PostModel.findById(req.params.postId);
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" });
  }
};

// Like Post
export const likePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(req.user.id)) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();

    res.status(200).json(post.likes);
  } catch (error) {
    res.status(500).json({ message: "Failed to like post" });
  }
};

// get post comment
export const getPostComments = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId).populate(
      "comments"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post.comments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching comments" });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await post.deleteOne();
    // await post.remove();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({ error: "Error deleting post" });
  }
};
