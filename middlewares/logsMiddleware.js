import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Convert `import.meta.url` to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log file path
const logFilePath = path.join(__dirname, "../logs/apiLogs.txt");

export const logger = (req, res, next) => {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  // Format log entry
  const logEntry = `[--> ${date} ${time} ${req.method} ${req.originalUrl}]\n`;

  // Append the log entry to file
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error("Error logging API request:", err);
    }
  });

  console.log(logEntry.trim());

  next();
};
