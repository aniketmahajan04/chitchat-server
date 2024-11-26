import { Request, Response } from "express-serve-static-core"
import { UserModel } from "../models/user"

export const newUser = async (req: Request, res: Response) => {
    const avatar = {
        public_id: "kafkdhsk",
        url: "kadjkhk",
    };

    await UserModel.create({
        name: "demoUser",
        username: "Demo",
        password: "demoPassword",
        avatar,
    });

    res.status(201).json({ msg: "User Connected" })
};

export const login = (req: Request, res: Response) => {
    res.send("hello from login")
}

