import { Member } from "../interfaces/chat.interface";

export const getOtherMember = (
    members: Member[],
    userId: string
): Member | undefined => {
   return members.find((member) => { member._id.toString() !== userId.toString() })
};