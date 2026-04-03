import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB connected"));
  } catch (err) {
    console.log(`Error: ${err.message}`);
    console.log("Error connecting to  mongoDB");
    process.exit(1);
  }
};

export default connectDB;
