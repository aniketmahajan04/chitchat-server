import mongoose from "mongoose";

export const connectDB = async(url: string): Promise<void> => {
    try{
        const connection = await mongoose.connect(url);
        console.log(`Connected to DB: ${connection.connection.host}`);
    } catch(error) {
        console.error("Error connecting to the databse:", error);
        throw new Error("Failed to connect to the database")
    }
}