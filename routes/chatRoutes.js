import express from "express";
import {
  createOneOnOneChat,
  createGroupChat,
  getUserChats,
} from "../controllers/chatController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", auth, createOneOnOneChat);
router.post("/group", auth, createGroupChat);
router.get("/", auth, getUserChats);

export default router;
