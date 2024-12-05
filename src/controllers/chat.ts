import { ChatModel } from "../models/chat";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { UserModel } from "../models/user";

const newChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;

    if(!userId) {
        res.status(400).json({
            msg: "Unauthorised"
        });
        return;
    }
    const { member } = req.body;

    try{

        if(!member || !Array.isArray(member) || member.length !== 1){
            res.status(400).json({
                msg: "Member must be an array with exactly one user ID"
            });
            return;
        }

        const otherUserId = member[0];

        const otherUser = await UserModel.findById(otherUserId);
        if(!otherUser){
            res.status(404).json({
                msg: "user not found"
            });
            return;
        }

        const existingChat = await ChatModel.findOne({
            groupChat: false,
            member: { $all: [userId, otherUserId] }
        })
        if(existingChat) {
            res.status(200).json({
                msg: "Chat is already exists",
                chat: existingChat
            });
            return;
        }

        await ChatModel.create({
            name: "One-to-One Chat",
            groupChat: false,
            creator: userId,
            member: [userId, otherUserId]
        });

        res.status(201).json({
            msg: "created",
        });
    } catch(error) {  
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        })

    }
};

const newGroupChat = async (req : AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    if(!userId) {
        res.status(401).json({
            msg: "Unauthorized"
        });
        return;
    }

    const { name, members } = req.body;
    try {

        //in array creating a set for unique values
        const allMember = [...new Set([...members, userId])];

        if(allMember.length < 3) {
            res.status(400).json({
                msg: "Group must have at least 3 members"
            });
            return;
        }
    
        await ChatModel.create({
            name: name,
            groupChat: true,
            creator: userId,
            members: allMember
        })
        res.status(201).json({
            msg: "Group is created",
        });

    } catch(error){
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
}

export {
    newChat,
    newGroupChat,
}