import { Router } from "express";
import { login } from "../controllers/user";

const userRouter = Router();

userRouter.get("/login", login);

export default userRouter;