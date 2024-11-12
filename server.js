import express from "express";
import dotenv from "dotenv";
import chalk from "chalk";

import { dbConnect } from "./configs/dbConnect.js";
import { logger } from "./middlewares/logsMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

dotenv.config();

const app = express();

dbConnect();

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger); // log middleware

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/group", groupRoutes);

// STARTING THE APP
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(
    chalk.green("->"),
    chalk.blue(` Server is running on port ${PORT}`)
  );
});
