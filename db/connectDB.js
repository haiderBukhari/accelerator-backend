import mongoose from "mongoose";

export const connectDB = async () => {
    const connectionString = process.env.MONGODB_URL || '';
    try {
        await mongoose.connect(connectionString);
        console.log("MongoDB Connected...");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
}