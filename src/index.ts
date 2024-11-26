import express from "express";
import mongoose from "mongoose";
import { PORT, MONGO_URL } from "./config/config";
import  userRouter  from "./routes/user"

const app = express()
app.use(express.json());

app.use("/api/v1/user", userRouter);

async function main() {
    if(!MONGO_URL){
        throw new Error("MONGO_URL is not defined");
    }
    await mongoose.connect(MONGO_URL)
}

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})