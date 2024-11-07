import UserModel from "../models/UserModel.js";

//get user by id
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting User:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//get all users
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json(err);
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json(err);
  }
};
