import { NextFunction, Request, Response, RequestHandler } from "express";
import { z } from "zod";

export const zodValidation: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const requiredBody = z.object({
        email: z.string().email().min(10),
        username: z.string().min(3).max(20),
        password: z.string().min(3).max(20),
    });

    const parsedDataWithSuccess = requiredBody.safeParse(req.body);

    if(!parsedDataWithSuccess.success){
        res.status(400).json({
            msg: "Incorrect Format",
            error: parsedDataWithSuccess.error.errors
        });
        return;
    }
    next();
}