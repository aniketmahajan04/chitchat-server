import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Request, Response } from "express"
import { UserModel } from "../models/user"
import { JWT_USER_PASSWORD } from "../config/config";

export const newUser = async (req: Request, res: Response): Promise<void> => {

    const { email, username, password } = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password, 5)
       
        await UserModel.create({
            email: email,
            username: username,
            password: hashedPassword
        });
        res.status(201).json({ msg: "user signup successfully" });

    } catch(error) {
        console.error("something went wrong", error);
    }


};

export const login = async (req: Request, res: Response): Promise<void> => {
    
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

interface AuthenticatedRequest extends Request {
        userId?: string;
};

export const updateDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    const { email, username } = req.body;

    if(!userId) {
        res.status(400).json({ msg: "Unauthoorized: User Id is missing" });
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

export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({
        msg: "Logged out successfully",
    })
}


