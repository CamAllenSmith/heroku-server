const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 3000

const paths = {
    "/": __dirname + "/index.html",
    "/rtc.js": __dirname + "/rtc.js",
    "/style.css": __dirname + "/style.css"
};
for (let p in paths) {
    let path = paths[p];
    app.get(p, (req, res) => res.sendFile(path));
}


io.on('connection', (socket) => {
    console.log('a user connected');

    //socket.broadcast.emit('hi');

    socket.on("room", room => {
        console.log("joining room: ", room);
        socket.join(room);
    })

    const relay_events = ["offer", "candidate", "answer"];
    for (let event of relay_events) {
        socket.on(event, (room_id, msg) => {
            console.log("[" + event + "]", { room_id: room_id, msg: msg });
            socket.to(room_id).emit(event, msg);
        });
    }


    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(port, () => {
    console.log('listening on *:' + port);
});

