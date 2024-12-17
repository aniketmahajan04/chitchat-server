import express from "express";
import cookieParser from "cookie-parser";
import { PORT, MONGO_URL } from "./config/config";
import  userRouter  from "./routes/userRouter"
import { connectDB } from "./utils/features";
import path from "path";
import chatRouter from "./routes/chatRouter";
import { createServer } from "http";
import cors from "cors";
import {v4 as uuidv4} from "uuid";

import { WebSocket, WebSocketServer } from "ws";
import { authenticateWebSocket } from "./middlewares/auth";
import { MessageModel } from "./models/message";
import { ChatModel } from "./models/chat";

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

const connecteUsers: { [key: string]: WebSocket } = {}

wss.on("connection", (socket, req) => {
    const params = new URLSearchParams(req.url?.split("?")[1]);
    const token = params.get("token");
    const decoded = authenticateWebSocket(token || "");

    if(!decoded || typeof decoded === "string" || decoded instanceof Error) {
        socket.close(4001, "Unauthorized");
        return;
    }

    const { username, id: userId } = decoded as {username: string; id: string};

    connecteUsers[userId] = socket;

    socket.on("open", async () => {
        console.log(`${username} connected`);

        const userGroups = await ChatModel.find({ members: userId }).select("_id");
        userGroups.forEach((group) => {
            const groupId = group._id.toString();
            for (const [id, ws] of Object.entries(connecteUsers)) {
                if(id !== userId) {
                    ws.send(
                        JSON.stringify({
                            type: "USER_CONNECTED", 
                            payload: { userId, username, groupId },
                        })
                    );
                }
            }
        });
    });

    socket.on("message", async (data) => {
        try {
            const { type, payload } = JSON.parse(data.toString());

            if(type == "SEND_MESSAGE") {
                const { content, attachments, chatId } = payload;
                
                const chat = await ChatModel.findById(chatId).populate("members");
                if(!chat) {
                    socket.send(
                        JSON.stringify({ type: "Error", message: "Chat not found." })
                    );
                return;
                }

                const message = await MessageModel.create({
                    content,
                    attachments,
                    sender: userId,
                    chat: chatId,
                });

                chat.members.forEach((member: any) => {
                    const userSocket = connecteUsers[member._id.toString()];
                    if(userSocket) {
                        userSocket.send(
                            JSON.stringify({
                                type: "USER_REMOVED",
                                payload: {
                                    message: {
                                        _id: message._id,
                                        content: message.content,
                                        attachments: message.attachments,
                                        sender: { id: userId },
                                        chat: chatId,
                                        createdAt: message.createdAt,
                                    },
                                },
                            })
                        );
                    }
                });

            } else if(type === "REMOVE_USER_FROM_GROUP") {
                const { chatId, targetedUserId } = payload;

                const chat = await ChatModel.findById(chatId);

                if(!chat) {
                    socket.send(
                        JSON.stringify({ type: "ERROR", msg: "Chat not found." })
                    );
                    return;
                }

                await ChatModel.updateOne(
                    { _id: chatId },
                    { $pull: { members: targetedUserId } }
                );

                chat.members.forEach((member: any) => {
                    const userSocket = connecteUsers[member._id.toString()];
                    if(userSocket){
                        userSocket.send(
                            JSON.stringify({
                                type: "USER_REMOVED",
                                payload: { chat, targetedUserId },
                            })
                        );
                    }
                });
            }
        } catch(error) {
            console.error("Error handling message: ", error);
            socket.send(
                JSON.stringify({
                    type: "ERROR", 
                    msg: "Invalid message format."
                })
            )
        }
    });

    socket.on("close", () => {
        delete connecteUsers[userId];
        console.log(`${username} disconnected`);
      });
})

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})

