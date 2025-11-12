import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();  // Load env variables

const mongoURI = process.env.MONGODB_URL;
console.log("MongoDB URI:", mongoURI); // Check if it's undefined

function connectDB() {
    if (!mongoURI) {
        console.error("Error: MONGODB_URL is not defined in .env");
        process.exit(1); // Stop execution
    }

    mongoose.connect(mongoURI)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB connection error:", err));
}

export default connectDB;
