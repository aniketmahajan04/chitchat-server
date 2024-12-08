import { Router } from "express";
import { 
    newChat,
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMember,
    removeMember,
    leaveGroup,
    sendAttachment
} from "../controllers/chat"
import { auth } from "../middlewares/auth";
import { attachments } from "../middlewares/multer";

const chatRouter = Router();

chatRouter.use(auth);

chatRouter.post("/newchat", newChat);
chatRouter.post("/newgroupchat", newGroupChat);
chatRouter.get("/getmychats", getMyChats);
chatRouter.get("/getmygroups", getMyGroups);
chatRouter.put("/addmember", addMember);
chatRouter.put("/removemember", removeMember);
chatRouter.delete("/leavegroup/:id", leaveGroup);
chatRouter.post("/send-attachment", attachments, sendAttachment);

export default chatRouter;