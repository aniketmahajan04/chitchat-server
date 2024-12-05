
import { User } from "../interfaces/user.interface"

export interface Chat {
    _id: string;
    name: string;
    members: User[];
    groupChat: boolean
};

export interface TransformedChat {
    _id: string,
    groupChat: boolean;
    avatar: string[];
    name: string;
    members: string[];
}