import { Router } from "express";
import { newAvatar } from "../controllers/avatar";

const uploadRouter = Router();

uploadRouter.post("/avatar", newAvatar);


export default uploadRouter;