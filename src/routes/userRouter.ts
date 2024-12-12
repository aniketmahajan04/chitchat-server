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
} from "../controllers/user";
import { auth } from "../middlewares/auth";
import { zodValidation } from "../middlewares/zod";
import { userSignupSchema } from "../lib/validators";
import { avatar } from "../middlewares/multer";

const userRouter = Router();

userRouter.post("/signup", avatar, zodValidation(userSignupSchema), newUser);
userRouter.post("/login", login);

userRouter.use(auth);

userRouter.put("/updatedetails", updateDetails);
userRouter.delete("/logout", logout);
userRouter.get("/getmyprofile", getMyProfile);
userRouter.get("/search", userSearch);

// Request routes

userRouter.post("/sent-request", sendFriendRequest);
userRouter.post("/acceptrequest", acceptFriendRequest);

export default userRouter;