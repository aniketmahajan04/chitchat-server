import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        public_id: {
            type: String,
            default: "default-avatar-id"
        },
        url: {
            type: String,
            default: "/uploads/default-avatar.png"
        }
    }
},
{
    timestamps: true,
})

export const UserModel = models.User || model("User", userSchema);