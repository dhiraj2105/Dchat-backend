import mongoose from "mongoose";
import chalk from "chalk";

export const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO);
    console.log(
      chalk.blue(
        chalk.green("->"),
        ` MongoDB connected: ${connect.connection.host}, ${connect.connection.name}`
      )
    );
  } catch (error) {
    console.error(chalk.red(`Error connecting to MongoDB: ${error}`));
    process.exit(1);
  }
};
