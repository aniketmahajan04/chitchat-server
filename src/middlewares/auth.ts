import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_USER_PASSWORD } from "../config/config";

export interface AuthenticatedRequest extends Request {
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
        console.error("JWT Verification Error:", error);
        res.status(401).json({ msg: "Invalid or expired token. Please login again." });
    }
};

export const authenticateWebSocket = (token: string) => {
    try {
        if(!token){
            throw new Error("JWT verification error");
        }

        if(!JWT_USER_PASSWORD) {
            throw new Error("JWT secret key is not defined");
        }

        return jwt.verify(token, JWT_USER_PASSWORD)

    } catch(error) {
        console.error(error);
        return null;
    }
}