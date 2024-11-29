import { z } from "zod";

export const userSignupSchema = z.object({
    email: z.string().email("Invalid email format").min(10, "Email must be at least 10 characters long"),
    username: z.string().min(3, "Username must be at least 3 characters long").max(20, "Username must be at most 20 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long").max(20, "Password must be at most 20 characters long"),
});