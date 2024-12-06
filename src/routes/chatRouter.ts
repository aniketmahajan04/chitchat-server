import { Router } from "express";
import { 
    newChat,
    newGroupChat,
    getMyChats,
    getMyGroups
} from "../controllers/chat"

import { auth } from "../middlewares/auth";

const chatRouter = Router();

chatRouter.use(auth);

chatRouter.post("/newchat", newChat);
chatRouter.post("/newgroupchat", newGroupChat);
chatRouter.get("/getmychats", getMyChats);
chatRouter.get("/getmygroups", getMyGroups);

export default chatRouter;