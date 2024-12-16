import express from "express";
import cookieParser from "cookie-parser";
import { PORT, MONGO_URL } from "./config/config";
import  userRouter  from "./routes/userRouter"
import { connectDB } from "./utils/features";
import path from "path";
import chatRouter from "./routes/chatRouter";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import {v4 as uuidv4} from "uuid";

import {
    CHAT_JOINED,
    CHAT_LEAVED,
    NEW_MESSAGE,
    NEW_MESSAGE_ALERT,
    ONLINE_USERS,
    START_TYPING,
    STOP_TYPING
} from "./constants/event";

import { corsOptions } from "./constants/config";
import { Socket } from "socket.io";
import { WebSocket, WebSocketServer } from "ws";
import { addMember } from "./controllers/chat";

// Check if MONGO_URL is defined
if (!MONGO_URL) {
    throw new Error("MONGO_URL is not defined in the environment variables");
}

connectDB(MONGO_URL);

const app = express()
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);

interface MessageForRealTime {
    content : string,
    _id: string,
    sender: {
        _id: string,
        name: string
    },
    chat: string,
    createdAt: Date | string,
};

wss.on("connection", (socket) => {
    console.log("user connected");

    socket.on("message", (message) => {

    });

    socket.on("close", () => {
        console.log("user disconnected");
    })
})

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})

