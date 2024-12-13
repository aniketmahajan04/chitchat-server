import { ChatModel } from "../models/chat";
import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { UserModel } from "../models/user";
import { getOtherMember } from "../lib/helper";
import { Chat, ChatDetailedMember, Member, TransformedChat } from "../interfaces/chat.interface";
import { Types } from "mongoose";
import { MessageModel } from "../models/message";

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
            members: { $all: [userId, otherUserId] }
        })
        if(existingChat) {
            res.status(200).json({
                msg: "Chat is already exists",
                chat: existingChat
            });
            return;
        }

        await ChatModel.create({
            name: otherUser.username,
            groupChat: false,
            creator: userId,
            members: [userId, otherUserId]
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
};

const getMyChats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    
    if(!userId){
        res.status(401).json({ msg: "Unauthorized" });
        return;
    }

    try{
        const chats: Chat[] = await ChatModel.find({ members: userId }).populate(
            "members",
            "name username avatar"
        );

        const transformedChat: TransformedChat[] = chats.map(({ _id, name, groupChat, members }) => {
            const otherMember = getOtherMember(members, userId);

            return {
                _id,
                groupChat,
                avatar: groupChat
                    ? members.slice(0, 3).map(({ avatar }) => avatar.url)
                    : [otherMember?.avatar.url || ""],
                name: groupChat ? name : otherMember?.name || "Unknown",
                members: members.reduce<string[]>((prev, curr) => {
                    if(curr._id.toString() !== userId.toString()){
                        prev.push(curr._id);
                    }
                    return prev;
                }, []),
            };
        });
        res.status(201).json({
            success: true,
            transformedChat
        });
        
    } catch(error){
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

const getMyGroups = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const chats = await ChatModel.find({
            groupChat: true,
            creator: req.userId
        }).populate(
            "members", "name avatar"
        );

        const groups = chats.map(({members, _id, groupChat,name}: any) => ({
            _id,
            groupChat,
            name,
            avatar: (members as Member[]).slice(0, 3).map(({avatar}) => avatar.url)
        }))

        res.status(201).json({
            success: true,
            groups
        })

    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

const addMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {  chatId, memberId } = req.body;
    const userId = req.userId;

    if(!chatId || !memberId) {
        res.status(400).json({
            mag: "Chat Id and Member Id are required"
        });
        return;
    }

    try{

        const chat = await ChatModel.findById( chatId )

        if(!chat) {
            res.status(404).json({
                msg: "Chat not found"
            });
            return;
        }

        if(chat.creator.toString() !== userId?.toString()) {
            res.status(403).json({
                success: false,
                msg: "You are not authorized to add members in group"
            });
            return;
        }

        if(chat.members.includes(memberId)) {
            res.status(400).json({
                success: false,
                msg: "User already member of group"
            });
            return;
        }

        chat.members.push(memberId);
        await chat.save();

        res.status(200).json({
            success: true,
            mag: "Member added successfully"
        })

    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

const removeMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { chatId, userId } = req.body;
    if(!chatId || !userId) {
        res.status(400).json({ msg: "Chat Id and Member Id required" });
        return;
    }

    try{
        const [chat, userThatWillBeRemovable] = await Promise.all([
            ChatModel.findById(chatId),
            UserModel.findById(userId, "name")
        ]);

        if(!chat){
            res.status(404).json({ msg: "Chat not found" });
            return;
        }

        if(!chat.groupChat) {
            res.status(400).json({ msg: "This is not groupchat" });
            return;
        }

        if(chat.creator.toString() !== req.userId?.toString()){
            res.status(403).json({
                msg: "You are not allowed to remove members"
            });
            return;
        }

        if(chat.creator.toString() === req.userId?.toString()) {
            res.status(403).json({
                msg: "The creator cannot remove themselves from the group"
            });
            return;
        }

        if(chat.members.length <= 3){
            res.status(400).json({ msg: "Group at least have 3 three members" });
            return;
        }
        const allChatMember = chat.members.map((i: Types.ObjectId) => i.toString());

        chat.members = chat.members.filter(
            (member: Types.ObjectId) => member.toString() !== userId.toString()
        );

        chat.save();
        res.status(200).json({
            success: true,
            msg: "Member removed successfully"
        });

    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

const leaveGroup = async(req: AuthenticatedRequest, res: Response): Promise<void> => {
    const chatId = req.params.id;
    try{
        const chat = await ChatModel.findById(chatId);
        if(!chat) {
            res.status(404).json({ msg: "Chat not found" });
            return;
        }
        if(!chat.groupChat){
            res.status(400).json({ msgg: "This is not group chat" });
            return;
        }

        const remainingMembers = chat.members.filter(
            (member: Types.ObjectId) => member.toString() !== req.userId?.toString()
        );

        if(chat.members.length <= 3){
            res.status(400).json({ msg: "Group at least have 3 three members" });
            return;
        }

        if(chat.creator.toString() === req.userId?.toString()) {
            res.status(403).json({
                msg: "The creator cannot remove themselves from the group"
            });
            return;
        }

        chat.members = remainingMembers;
        chat.save();

        res.status(200).json({
            success: true,
            msg: "Group leaved successfully"
        })

    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

const sendAttachment = async (req: AuthenticatedRequest, res :Response): Promise<void> => {
    try{
        const { chatId } = req.body;
        const files = req.files as Express.Multer.File[];
        if (!chatId) {
            res.status(400).json({ msg: "Chat ID is required." });
            return;
        }

         if(!files || files.length === 0){
            res.status(400).json({ msg: "No files were uploaded." });
            return;
         }

         if(files.length > 5){
            res.status(400).json({ msg: "Cannot upload more than 5 files" });
            return;
         }
         
        const [chat, me] = await Promise.all([
            ChatModel.findById(chatId),
            UserModel.findById(req.userId),
        ]);

        if(!chat || !me) {
            res.status(404).json({ 
                msg: "Chat Id or User Id not found"
            });
            return;
        }

        const attachments = files.map((file) => ({
            public_id: file.filename,
            url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        }));

        const message = await MessageModel.create({
            content: "",
            attachments: attachments,
            sender: me._id,
            chat: chat._id
        });
        res.status(201).json({
            msg: "Attachment send successfully",
            message
        });

    } catch(error){
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

const getChatDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try{
        const userId = req.userId;
        const chatId = req.params.id;
        if(!userId){
            res.status(400).json({
                msg: "Unauthorized"
            });
            return;
        }
        if(!chatId){
            res.status(400).json({
                mag: "Chat Id required"
            });
            return;
        }
        const chat = await ChatModel.findById(chatId)
        .populate<{ members: ChatDetailedMember[] }>("members", "name avatar");

        if(!chat){
            res.status(404).json({
                msg: "Chat not found!"
            }); 
            return;
        }

        chat.members = chat.members.map((member: ChatDetailedMember) => ({
            _id: member._id,
            name: member.name,
            avatar: member.avatar
        }));
        res.status(200).json({
            success: true,
            chat,
        })
    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

const renameGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const chatId = req.params.id;
    const { name } = req.body;
    const userId = req.userId;

    if(!userId){
        res.status(400).json({
            msg: "Unauthorized"
        });
        return;
    }
    if(!chatId || !name) {
        res.status(400).json({
            msg: "Chat Id or Name not provided"
        })
    }
    try{

        const chat = await ChatModel.findById(chatId);
        if(!chat) {
            res.status(404).json({
                msg: "Chat not found"
            });
            return;
        }

        if(!chat.groupChat) {
            res.status(400).json({
                msg: "This is not group chat"
            });
            return;
        }
        if(chat.creator.toString() !== userId.toString()){
            res.status(403).json({
                msg: "You are not allowed to rename group"
            });
            return;
        }
        chat.name = name;
        await chat.save();

        res.status(201).json({
            success: true,
            msg: "Group rename successfully"
        });

    } catch(error){
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

const deleteChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const chatId = req.params.id;
    const userId = req.userId;
    if(!userId) {
        res.status(400).json({ msg: "Unauthorized" });
        return;
    }
    if(!chatId) {
        res.status(400).json({ msg : "Please provide chat Id" });
        return;
    }
    try{
        const chat = await ChatModel.findById(chatId);
        if(!chat){
            res.status(404).json({ msg: "Chat not found" });
            return;
        }

        if(!chat.members.includes(userId)){
            res.status(403).json({ msg: "You are not allowed to delete this chat" });
            return;
        }

        await Promise.all([
            chat.deleteOne(),
            MessageModel.deleteMany({ chat: chatId })
        ]);
        res.status(200).json({
            success: true,
            msg: "Chat deleted successfully",
        })
    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

const getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const chatId = req.params.id;
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const resultPerPage = 20;
    const skipPage = ( page as number - 1 ) * resultPerPage;
    try{
        if(!userId) {
            res.status(403).json({
                msg: "Unauthorized"
            });
            return;
        }
        if(!chatId){
            res.status(400).json({ msg: "Chat Id is not provided" });
            return;
        }
        const chat = await ChatModel.findById(chatId);
        if(!chat) {
            res.status(404).json({
                msg: "Chat not found"
            });
            return;
        }
        if(!chat.members.includes(userId)) {
            res.status(403).json({ msg: "You are not allowed to access this chat" });
            return;
        }

        const [message, totalMessageCount] = await Promise.all([
            MessageModel.find({ chat: chatId })
                .sort({ createdAt: - 1 })
                .skip(skipPage)
                .limit(resultPerPage)
                .populate("sender", "name")
                .lean(),
            MessageModel.countDocuments({ chat: chatId }),
        ]);

        const totalPages = Math.ceil(totalMessageCount / resultPerPage) || 0;
        res.status(200).json({
            success: true,
            message: message.reverse(),
            totalPages,
        });
    }  catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

export {
    newChat,
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMember,
    removeMember,
    leaveGroup,
    sendAttachment,
    getChatDetails,
    renameGroup,
    deleteChat,
    getMessages
}