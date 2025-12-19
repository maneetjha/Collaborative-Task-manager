let ioInstance;
const userSockets = new Map(); 

const init = (io) => {
    ioInstance = io;
};

const notifyUser = (userId, event, data) => {
    if (!ioInstance) return console.error("Socket.io not initialized!");
    
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
        ioInstance.to(socketId).emit(event, data);
    }
};

const broadcastUpdate = (event, data) => {
    if (!ioInstance) return console.error("Socket.io not initialized!");
    ioInstance.emit(event, data);
};


module.exports = { init, notifyUser, broadcastUpdate, userSockets };