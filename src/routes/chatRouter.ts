import { Router } from "express";
import { 
    newChat,
    newGroupChat
} from "../controllers/chat"

import { auth } from "../middlewares/auth";

const chatRouter = Router();

chatRouter.use(auth);

chatRouter.post("/newchat", newChat);
chatRouter.post("/newgroupchat", newGroupChat);

export default chatRouter;