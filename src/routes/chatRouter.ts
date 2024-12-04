import { Router } from "express";
import { 
    newChat,
} from "../controllers/chat"

import { auth } from "../middlewares/auth";

const chatRouter = Router();

chatRouter.use(auth);

chatRouter.post("/newchat", newChat);

export default chatRouter;