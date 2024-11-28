import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_USER_PASSWORD } from "../config/config";

interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token;

    if(!token) {
        res.status(401).json({ 
            msg: "Please login",
        });
        return;
    }

    try{
        if(!JWT_USER_PASSWORD) {
            throw new Error("JWT secret key is not defined");
        }

        const decodedData = jwt.verify(token, JWT_USER_PASSWORD) as { id: string }
        req.userId = decodedData.id;
        next();
    } catch(error) {
        console.error("Something ent wrong", error);
        res.status(500).json({ msg: "Internal server error" });
    }
};