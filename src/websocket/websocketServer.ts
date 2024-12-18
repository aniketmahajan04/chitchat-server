import { connecteUsers } from "./websocketStore";
import { WebSocketServer } from "ws";
import { authenticateWebSocket } from "../middlewares/auth";
import { ChatModel } from "../models/chat";
import { MessageModel } from "../models/message";

export const setUpWebSocketServer = (wss: WebSocketServer) => {
    wss.on("connection", (socket, req) => {
        const params = new URLSearchParams(req.url?.split("?")[1]);
        const token = params.get("token");
        const decoded = authenticateWebSocket(token || "");
    
        if(!decoded || typeof decoded === "string" || decoded instanceof Error) {
            socket.close(4001, "Unauthorized");
            return;
        }
    
        const { username, id: userId } = decoded as { username: string; id: string};
    
        if (!connecteUsers[userId]) connecteUsers[userId] = [];
        connecteUsers[userId].push(socket);
    
        socket.on("open", async () => {
            console.log(`${username} connected`);
    
            try{
    
                const userGroups = await ChatModel.find({ members: userId }).select("_id");
                userGroups.forEach((group) => {
                    const groupId = group._id.toString();
                    group.members.forEach((memberId: any) => {
                        if(memberId !== userId){
                            const memberSocket = connecteUsers[memberId];
                            if(memberSocket){
                                memberSocket.forEach((socket) => {
                                    socket.send(
                                        JSON.stringify({
                                            type: "USER_CONNECTED",
                                            payload: { userId, username, groupId },
                                        })
                                    )
                                })
                            }
                        }
                    })
                });
            } catch(error){
                console.error("Error fetching user groups:", error);
            }
            });
    
        socket.on("message", async (data) => {
            try {
                const { type, payload } = JSON.parse(data.toString());
    
                if(type === "SEND_MESSAGE") {
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
                            userSocket.forEach((socket) => {
                                socket.send(
                                    JSON.stringify({
                                        type: "NEW_MESSAGE",
                                        payload: {
                                            message: {
                                                _id: message._id,
                                                content: message.content,
                                                attachments: message.attachments,
                                                sender: { _id: userId },
                                                chat: chatId,
                                                createdAt: message.createdAt,
                                            },
                                        },
                                    })
                                );
                            })
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
            connecteUsers[userId] = connecteUsers[userId].filter((ws) => ws !== socket);
            if (connecteUsers[userId].length === 0) delete connecteUsers[userId];
            console.log(`${username} disconnected`);
        })
    });
}