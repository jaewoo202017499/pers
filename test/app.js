const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let roomCount = 1;
const rooms = {};

app.get('/:room', (req, res) => {
    const room = req.params.room;
    res.sendFile(__dirname + '/V12.html');
});

app.get('/', (req, res) => {
    const room = getNextRoom();
    res.redirect(`/${room}`);
});

function getNextRoom() {
    return roomCount++;
}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join room', (room) => {
        socket.join(room);
        if (!rooms[room]) {
            rooms[room] = [];
        }
        socket.emit('previous messages', rooms[room]);
    });

    socket.on('chat message', (data) => {
        const room = data.room;
        const msg = data.msg;
        msg.timestamp = new Date();
        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(msg);
        io.to(room).emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});