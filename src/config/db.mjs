import mongoose from "mongoose";

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  try {
    const connection = await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export default connectDB;
