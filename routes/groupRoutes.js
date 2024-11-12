import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import {
  commentOnGroupPost,
  createGroup,
  createGroupPost,
  deleteGroup,
  editGroup,
  getGroupPostDetails,
  joinGroup,
  leaveGroup,
  likeGroupPost,
  listAllGroups,
  viewGroupDetails,
  viewGroupPosts,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", auth, createGroup);
router.post("/join/:groupId", auth, joinGroup);
router.post("/leave/:groupId", auth, leaveGroup);
router.post("/:groupId/post", auth, createGroupPost);
router.post("/post/:postId/like", auth, likeGroupPost);
router.post("/post/:postId/comment", auth, commentOnGroupPost);

router.get("/", auth, listAllGroups);
router.get("/:groupId", auth, viewGroupDetails);
router.get("/:groupId/posts", auth, viewGroupPosts);
router.get("/:groupId/posts/:postId", auth, getGroupPostDetails);

router.put("/:groupId/edit", auth, editGroup);

router.delete("/:groupId", auth, deleteGroup);

export default router;
