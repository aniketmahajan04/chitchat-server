import express from "express";
import { PORT, MONGO_URL } from "./config/config";
import  userRouter  from "./routes/userRouter"
import { connectDB } from "./utils/features";


const app = express()
app.use(express.json());

// Check if MONGO_URL is defined
if (!MONGO_URL) {
    throw new Error("MONGO_URL is not defined in the environment variables");
}

connectDB(MONGO_URL);

app.use("/api/v1/user", userRouter);


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})

