import { Router } from "express";
import { 
    newChat,
    newGroupChat,
    getMyChats
} from "../controllers/chat"

import { auth } from "../middlewares/auth";

const chatRouter = Router();

chatRouter.use(auth);

chatRouter.post("/newchat", newChat);
chatRouter.post("/newgroupchat", newGroupChat);
chatRouter.get("/getmychats", getMyChats);

export default chatRouter;