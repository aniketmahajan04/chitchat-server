import { User } from "../interfaces/user.interface"

export const getOtherMember = (
    members: User[],
    userId: string
): User | undefined => {
   return members.find((member) => { member._id.toString() !== userId.toString() })
};