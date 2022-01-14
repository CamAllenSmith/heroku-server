"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var socket_io_1 = require("socket.io");
var path = require("path");
var app = express();
var server = http.createServer(app);
var io = new socket_io_1.Server(server);
var port = process.env.PORT || 3000;
var root = path.join(__dirname, "../../");
// root dir goes to index.html
app.get("/", function (_, res) { return res.sendFile(root + 'index.html'); });
// serving "out" and "style" folders as static content
app.use("/client", express.static(root + "out/client"));
app.use("/style", express.static(root + "style"));
io.on("connection", function (socket) {
    console.log("USER CONNECTED: ", socket);
    socket.on("room", function (room) {
        console.log("joining room: ", room);
        socket.join(room);
    });
    // #region relay events
    // when one of these events is received, pass information back to everyone else in the same room
    var relay_events = ["offer", "candidate", "answer"];
    var _loop_1 = function (event_1) {
        socket.on(event_1, function (room_id, msg) {
            console.log("[" + event_1 + "]", { room_id: room_id, msg: msg });
            socket.to(room_id).emit(event_1, msg);
        });
    };
    for (var _i = 0, relay_events_1 = relay_events; _i < relay_events_1.length; _i++) {
        var event_1 = relay_events_1[_i];
        _loop_1(event_1);
    }
    // #endregion
    socket.on("disconnect", function (socket) {
        console.log("USER DISCONNECTED", socket);
    });
});
server.listen(port, function () {
    console.log('listening on *:' + port);
    console.log("__dirname = " + __dirname);
    console.log("root = " + root);
});
