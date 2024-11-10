import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import {
  acceptFriendRequest,
  declineFriendRequest,
  sendFriendRequest,
  viewFriendList,
} from "../controllers/friendController.js";

const router = express.Router();

// Route to send a friend request
router.post("/request/:userId", auth, sendFriendRequest);
router.post("/accept/:requestId", auth, acceptFriendRequest); // Route to accept a friend request
router.post("/decline/:requestId", auth, declineFriendRequest);
router.get("/list", auth, viewFriendList);

export default router;
