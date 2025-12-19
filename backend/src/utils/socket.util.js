const { io, userSockets } = require('../server');

const notifyUser = (userId, event, data) => {
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
        io.to(socketId).emit(event, data);
    }
};

const broadcastUpdate = (event, data) => {
    io.emit(event, data); // Sends to everyone online
};

module.exports = { notifyUser, broadcastUpdate };