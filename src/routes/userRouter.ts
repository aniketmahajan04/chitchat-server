import { Router } from "express";
import { login, newUser } from "../controllers/user";
import { auth } from "../middlewares/auth";
import { zodValidation } from "../middlewares/zod";

const userRouter = Router();

userRouter.post("/signup", zodValidation, newUser);
userRouter.post("/login", login);


export default userRouter;