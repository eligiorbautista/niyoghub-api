import app from "./app.mjs";
import connectDB from "./config/db.mjs";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.clear();

    // Connect to MongoDB
    await connectDB();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} ✔`);
    });
  } catch (error) {
    console.error("Error starting the server ✘ :", error);
  }
};

startServer();
