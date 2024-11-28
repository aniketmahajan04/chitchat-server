import { Router } from "express";
import { Request, Response } from "express";
import { login, newUser, updateDetails } from "../controllers/user";
import { auth } from "../middlewares/auth";
import { zodValidation } from "../middlewares/zod";
import { AuthenticatedRequest } from "../middlewares/auth";

const userRouter = Router();

userRouter.post("/signup", zodValidation, newUser);
userRouter.post("/login", login);
userRouter.put("/updateprofile", auth, (req: AuthenticatedRequest, res: Response) => updateDetails(req, res));



export default userRouter;