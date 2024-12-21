import { z } from "zod";
import { addMember } from "../controllers/chat";

const userSignupSchema = z.object({
    email: z.string().email("Invalid email format").min(10, "Email must be at least 10 characters long"),
    username: z.string().min(3, "Username must be at least 3 characters long").max(20, "Username must be at most 20 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long").max(20, "Password must be at most 20 characters long"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format").min(6, { message: "Email must be least 6 characters" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const updateDetailsScheme = z.object({
    email: z.string().email().min(6, { message: "Email must be at least 6 characters" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
});

const sendFriendRequestSchema = z.object({
    receiverId: z.string(),
});

const newGroupSchema = z.object({
    name: z.string().min(3, { message: "name must be at least 3 characters" }).max(20, "Name must be at most 20 characters long"),
    members: z.array(z.string()),
});



export {
    userSignupSchema,
    loginSchema,
    updateDetailsScheme,
    sendFriendRequestSchema,
    newGroupSchema,
}