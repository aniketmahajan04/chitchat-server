import { Router } from "express";
import { Response } from "express";
import { login, newUser, updateDetails, logout } from "../controllers/user";
import { auth } from "../middlewares/auth";
import { zodValidation } from "../middlewares/zod";
import { AuthenticatedRequest } from "../middlewares/auth";

const userRouter = Router();

userRouter.post("/signup", zodValidation, newUser);
userRouter.post("/login", login);
userRouter.put("/updateprofile", auth, (req: AuthenticatedRequest, res: Response) => updateDetails(req, res));
userRouter.delete("/logout", auth, logout);

export default userRouter;