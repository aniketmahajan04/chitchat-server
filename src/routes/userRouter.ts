import { Router } from "express";
import { login, newUser } from "../controllers/user";

const userRouter = Router();

userRouter.post("/new", newUser);
userRouter.get("/login", login);

export default userRouter;