import express = require('express');
import http = require('http');
import { Server } from "socket.io";
import path = require("path");


const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

const root = path.join(__dirname, "../../");

// root dir goes to index.html
app.get("/", (_, res) => res.sendFile(root + 'index.html'));


// serving "out" and "style" folders as static content
app.use("/client", express.static(root + "out/client"));
app.use("/style", express.static(root + "style"));


io.on("connection", (socket) => {
    console.log("USER CONNECTED: ", socket);

    socket.on("room", room => {
        console.log("joining room: ", room);
        socket.join(room);
    })

    // #region relay events
    // when one of these events is received, pass information back to everyone else in the same room
    const relay_events = ["offer", "candidate", "answer"];
    for (let event of relay_events) {
        socket.on(event, (room_id, msg) => {
            console.log("[" + event + "]", { room_id: room_id, msg: msg });
            socket.to(room_id).emit(event, msg);
        });
    }
    // #endregion

    socket.on("disconnect", (socket) => {
        console.log("USER DISCONNECTED", socket);
    });
});



server.listen(port, () => {
    console.log('listening on *:' + port);
    console.log("__dirname = " + __dirname);
    console.log("root = " + root);
});

