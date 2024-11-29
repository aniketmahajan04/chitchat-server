import { Router } from "express";
import { login, newUser, updateDetails, logout } from "../controllers/user";
import { auth } from "../middlewares/auth";
import { zodValidation } from "../middlewares/zod";
import { userSignupSchema } from "../lib/validators";
import { avatar } from "../middlewares/multer";

const userRouter = Router();

userRouter.post("/signup", avatar, zodValidation(userSignupSchema), newUser);
userRouter.post("/login", login);
userRouter.put("/updatedetails", auth, updateDetails);
userRouter.delete("/logout", auth, logout);

export default userRouter;