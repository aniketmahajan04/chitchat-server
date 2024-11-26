
import { Schema, model, models, Types } from "mongoose";

const requestSchema = new Schema({
    
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "accepted", "rejected"],
    },

    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },

    receiver: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    
}, 
{
    timestamps: true
}
)

export const RequestModel = models.Request || model("Request", requestSchema);