import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import {
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", auth, updateUser);
router.delete("/:id", deleteUser);

export default router;
