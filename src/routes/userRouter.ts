import { Router } from "express";
import { 
    login,
    newUser,
    updateDetails,
    logout,
    getMyProfile,
    userSearch,
    sendFriendRequest,
    acceptFriendRequest,
    getMyNotification,
    getMyFriends,
} from "../controllers/user";
import { auth } from "../middlewares/auth";
import { zodValidation } from "../middlewares/zod";
import { loginSchema, sendFriendRequestSchema, updateDetailsScheme, userSignupSchema } from "../lib/validators";
import { avatar } from "../middlewares/multer";

const userRouter = Router();

userRouter.post("/signup", avatar, zodValidation(userSignupSchema), newUser);
userRouter.post("/login", zodValidation(loginSchema), login);

userRouter.use(auth);

userRouter.put("/updatedetails", zodValidation(updateDetailsScheme),updateDetails);
userRouter.delete("/logout", logout);
userRouter.get("/getmyprofile", getMyProfile);
userRouter.get("/search", userSearch);

// Request routes

userRouter.post("/sent-request", zodValidation(sendFriendRequestSchema), sendFriendRequest);
userRouter.post("/acceptrequest", acceptFriendRequest);
userRouter.get("/notifications", getMyNotification);
userRouter.get("/friends", getMyFriends);

export default userRouter;