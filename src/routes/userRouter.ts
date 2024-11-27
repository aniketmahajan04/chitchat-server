import { Router } from "express";
import { login, newUser } from "../controllers/user";

const userRouter = Router();

userRouter.post("/signup", newUser);
userRouter.post("/login", login);

export default userRouter;