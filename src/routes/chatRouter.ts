import { Router } from "express";
import { 
    newChat,
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMember
} from "../controllers/chat"

import { auth } from "../middlewares/auth";

const chatRouter = Router();

chatRouter.use(auth);

chatRouter.post("/newchat", newChat);
chatRouter.post("/newgroupchat", newGroupChat);
chatRouter.get("/getmychats", getMyChats);
chatRouter.get("/getmygroups", getMyGroups);
chatRouter.put("/addmember", addMember);

export default chatRouter;