import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const zodValidation = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const parsedDataWithSuccess = schema.safeParse(req.body);

        if(!parsedDataWithSuccess.success){
            res.status(400).json({
                msg: "Validation error",
                errors: parsedDataWithSuccess.error.errors,
            });
            return;
        }

        next();
    };
};

