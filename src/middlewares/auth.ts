import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_USER_PASSWORD } from "../config/config";
import { CHICHAT_TOKEN } from "../constants/config";

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies?.[CHICHAT_TOKEN];

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

export const AuthenticateSocket = (ws: WebSocket, req: Request) => {
    const cookies = req.headers.cookie || "";
    const cookiesMap = Object.fromEntries(
        cookies.split(";").map((c) => c.trim().split("="))
    );

    const token = cookiesMap[CHICHAT_TOKEN];
    if(!token) {
        ws.send(JSON.stringify({ error: "Authentication failed: No Token" }));
        ws.close();
        return null;
    }

    try {
        const decodedData = jwt.verify(token, JWT_USER_PASSWORD)
    } catch(error) {
        ws.send(JSON.stringify({ error: "Authentication failed: Invalid token" }));
        ws.close();
        return null;
    }
}

