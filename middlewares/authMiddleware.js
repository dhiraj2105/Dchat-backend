import jwt from "jsonwebtoken";

// auth middleware
// export const auth = async (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token)
//     return res
//       .status(401)
//       .send({ message: "Access denied. No token provided." });

//   try {
//     const decoded = jwt.verify(token, process.env.SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(400).send({ message: "Invalid token." });
//   }
// };

import UserModel from "../models/UserModel.js";
export const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.header("Authorization").replace("Bearer ", "");

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET);

    // Find the user in the database using the decoded token information
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User authentication failed" });
    }

    // Attach user data to req.user for use in subsequent routes
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    res.status(401).json({ error: "User authentication failed" });
  }
};
