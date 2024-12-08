import { Router } from "express";
import { 
    newChat,
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMember,
    removeMember,
    leaveGroup,
    sendAttachment,
    getChatDetails,
    renameGroup,
    deleteChat,
    getMessages
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
chatRouter.get("/chatdetailes/:id", getChatDetails);
chatRouter.put("/renamegroup/:id", renameGroup);
chatRouter.delete("/deletechat/:id", deleteChat);
chatRouter.get("/messages/:id", getMessages);

export default chatRouter;