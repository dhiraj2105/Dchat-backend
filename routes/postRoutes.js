import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import {
  createPost,
  addComment,
  likePost,
  getAllPosts,
  getPostDetails,
  getPostComments,
  deletePost,
  editPost,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/", auth, createPost);
router.post("/:postId/comments", auth, addComment);
router.post("/:postId/like", auth, likePost);

router.get("/", getAllPosts);
router.get("/:postId", getPostDetails);
router.get("/:postId/comments", getPostComments);

router.put("/:postId", auth, editPost);

router.delete("/:postId", auth, deletePost);

export default router;
