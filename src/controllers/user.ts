import { Request, Response } from "express-serve-static-core"

export const login = (req: Request, res: Response) => {
    res.send("hello from login")
}

