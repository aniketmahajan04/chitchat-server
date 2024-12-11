import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Request, Response } from "express"
import { UserModel } from "../models/user"
import { JWT_USER_PASSWORD } from "../config/config";
import { AuthenticatedRequest } from "../middlewares/auth";
import { RequestModel } from "../models/request";

const newUser = async (req: Request, res: Response): Promise<void> => {

    const { email, username, password } = req.body;

    const defaultAvatar = {
        public_id: "default-avatar",    // the identifier can be anything unique for the image
        url: "/uploads/default-avatar.png", 
    };
    
    const avatar = req.file ? {
        public_id: req.file.filename,
        url: `/uploads/${req.file.filename}`
    } : defaultAvatar;

    try{
        const hashedPassword = await bcrypt.hash(password, 5)
       
        const newUser = await UserModel.create({
            email: email,
            username: username,
            password: hashedPassword,
            avatar: avatar,
        });
        res.status(201).json({ 
            msg: "user signup successfully",
            user: newUser
         });

    } catch(error) {
        console.error("something went wrong", error);
        res.status(500).json({ msg: "Internal server error, please try again" });
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    
    const { email, username, password } = req.body;
    try{
        const foundUser = await UserModel.findOne({
            email: email,
            username: username,
        });
        
        if(foundUser){
        
            const isMatch = await bcrypt.compare(password, foundUser.password)

            if(!isMatch){
                res.status(400).json({ msg: "Invalid Credentials" });
                return;
            }

            if(!JWT_USER_PASSWORD) {
                throw new Error("JWT secret key is not defined");
            }

            const token = jwt.sign({
                id: foundUser._id 
            }, JWT_USER_PASSWORD);

            res.cookie(
                'token', token, {
                    httpOnly: true,
                    secure: req.secure || false,
                    maxAge: 60 * 60 * 1000 
            });

            res.status(200).json({ msg: "Login successfully" });
        } else {
            res.status(400).json({ msg: "User not foung!" });
        }
    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({ msg: "Internal server error" })
    }

};


const updateDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    const { email, username } = req.body;

    if(!userId) {
        res.status(400).json({ msg: "Unauthorized: User Id is missing" });
        return;
    }

    if(!email || !username) {
        res.status(400).json({ msg: "Both email and username are required" });
        return;
    }

    try{
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: { email, username } },
            { new: true },
        );

        if (!updatedUser) {
            res.status(404).json({ msg: "User not found" });
            return;
        }

        res.status(200).json({
            msg: "Profile update successfully",
            updatedUser: updatedUser
        })
        
    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            msg: "Internal server error"
        })
    };

};

const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({
        msg: "Logged out successfully",
    })
};

const getMyProfile = async (req: AuthenticatedRequest , res: Response): Promise<void> => {
   const userId = req.userId;

   if(!userId) {
    res.status(400).json({ msg: "Unauthorized: User Id is missing" });
    return;
    }

   try{
        const user = await UserModel.findById(userId);

        if(!user) {
            res.status(404).json({
                msg: "User not found"
            });
            return;
        }

        const { email, username, avatar } = user;

        res.status(200).json({
            email,
            username,
            avatar
        });

    } catch(error) {
        console.error("Something went wrong", error);
            res.status(500).json({
                msg: "Internal server error"
            });
   }
};

const userSearch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

    const userId = req.userId;

    const { username } = req.query;

    if(!userId) {
        res.status(404).json({
            msg: "Unauthorized please login first"
        });
        return;
    }

    try{

        const searchUser = await UserModel.find({
            username: { $regex: username, $option: "i" }
        });

        if(!searchUser){
            res.status(404).json({
                msg: "User not found"
            });
            return;
        }

        res.status(200).json({
            searchUser,
        });

    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            msg:" Internal server error"
        });
    }

};

const sendFriendRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    const { receiverId } = req.body;

    try{
        if(!userId){
            res.status(403).json({
                msg: "Unauthorized"
            });
            return;
        }

        if(!receiverId){
            res.status(400).json({ msg: "Please provide receiver Id" });
            return;
        }

        if (userId === receiverId) {
            res.status(400).json({ success: false, msg: "You cannot send a friend request to yourself" });
            return;
        }

        const receiver = await UserModel.findById(receiverId);
        if(!receiver){
            res.status(404).json({ msg: "Receiver not found" });
            return;
        }

        const existingRequest = await RequestModel.findOne({
            $or: [
                { sender: userId, receiver: receiverId },
                { sender: receiverId, receiver: userId }
            ],
        });

        if(existingRequest){
            res.status(400).json({ 
                success: false,
                msg: "A friend request already exists" });
            return;
        }
        
        const requestSend = await RequestModel.create({
            sender: userId,
            receiver: receiverId
        });

        res.status(201).json({
            success: true,
            msg: "Request sent successfully",
            requestSend
        });
        
    } catch(error) {
        console.error("Something went wrong", error);
        res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
};

export {
    newUser,
    login,
    updateDetails,
    getMyProfile,
    logout,
    userSearch,
    sendFriendRequest
}