
import { Schema, model, models, Types } from "mongoose";

const messageSchema = new Schema({
    
    content: {
        type: String,
    },

    attachments: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            mimetype: {
                type: String,
            },
            size: {
                type: Number
            }
        },
    ],

    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    chat: {
        type: Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    
}, 
{
    timestamps: true
}
)

export const MessageModel = models.Message || model("Message", messageSchema);