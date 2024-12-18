import { connecteUsers } from "../websocket/websocketStore";


/**
 * Emit a WebSocket event to notify connected users about an action.
 * @param userId - ID of the user to notify.
 * @param type - Type of the event (e.g., "FRIEND_REQUEST").
 * @param payload - Data to send with the event.
 */

export const emitEvent = (userId: string, type: string, payload: any) => {
    const userSocket = connecteUsers[userId];
    if(userSocket) {
        userSocket.forEach((socket) => {
            socket.send(
                JSON.stringify({
                    type,
                    payload
                })
            )
        })
    }
}