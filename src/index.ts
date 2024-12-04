import express from "express";
import cookieParser from "cookie-parser";
import { PORT, MONGO_URL } from "./config/config";
import  userRouter  from "./routes/userRouter"
import { connectDB } from "./utils/features";
import path from "path";
import chatRouter from "./routes/chatRouter";


const app = express()
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Check if MONGO_URL is defined
if (!MONGO_URL) {
    throw new Error("MONGO_URL is not defined in the environment variables");
}

connectDB(MONGO_URL);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})

