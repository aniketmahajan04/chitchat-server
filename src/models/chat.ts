
import { Schema, model, models, Types } from "mongoose";

const chatSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    groupChat: {
        type: Boolean,
        default: false,
    },
    creator: {
        type: Types.ObjectId,
        ref: "User",
    },
    members: [
        {
            type: Types.ObjectId,
            ref: "User"
        },
    ],
}, 
{
    timestamps: true
}
)

export const ChatModel = models.Chat || model("Chat", chatSchema);
