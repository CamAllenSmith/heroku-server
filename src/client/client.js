// @ts-ignore
//import io from "/socket.io/socket.io.js";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var socket = io();
// TODO: prompt on button click, this will uniquely identify the call. probably have the server generated it using a Guid or something
var room_id = "12345678";
console.log("joing room: ", room_id);
socket.emit("room", room_id);
var conn = new RTCPeerConnection({
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        }
    ]
});
conn.addEventListener('icecandidate', function (event) {
    if (event.candidate) {
        console.log("sending candidate: ", event.candidate);
        socket.emit("candidate", room_id, event.candidate);
    }
});
// #region Data Channel
function DataChannelStateChange(label, channel) {
    return function () { return console.log(label + " channel state is: " + channel.readyState); };
}
var output_channel = conn.createDataChannel("output");
var outputStateChange = DataChannelStateChange("Output", output_channel);
output_channel.onopen = function () {
    outputStateChange();
    output_channel.send("DMs are open bb");
};
output_channel.onclose = outputStateChange;
// RECEIVE CHANNEL
conn.ondatachannel = function (e) {
    console.log("Received Data Channel... ", e);
    e.channel.onmessage = function (m) {
        console.log("Received Data Channel Message... ", m);
    };
    var onStateChange = DataChannelStateChange("Input", e.channel);
    e.channel.onopen = onStateChange;
    e.channel.onclose = onStateChange;
};
// #endregion
/** Called upon connecting to remote peer. Resolves the "connect" promise so everything waiting on connection can be released. */
var onConnect;
var connect = new Promise(function (resolve, _) { return onConnect = resolve; });
socket.on("answer", function (answer) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("received answer: ", answer);
                return [4 /*yield*/, conn.setRemoteDescription(answer)];
            case 1:
                _a.sent();
                // now resolve promise so cancidates can be added
                onConnect();
                return [2 /*return*/];
        }
    });
}); });
socket.on("candidate", function (candidate) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("received candidate: ", candidate);
                // sometimes candidates come in before connection is made. adding candidates in this state throws error, 
                // therefore, must wait for connection prior to adding
                return [4 /*yield*/, connect];
            case 1:
                // sometimes candidates come in before connection is made. adding candidates in this state throws error, 
                // therefore, must wait for connection prior to adding
                _a.sent();
                addCandidate(candidate);
                return [2 /*return*/];
        }
    });
}); });
socket.on("offer", function (offer) { return __awaiter(_this, void 0, void 0, function () {
    var answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("receiving offer...", offer);
                // TODO: if already connected, reject all new offers
                if (conn.remoteDescription) {
                    console.error("Already connected to a remote peer... rejecting new offer", offer);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, conn.setRemoteDescription(offer)];
            case 1:
                _a.sent();
                return [4 /*yield*/, conn.createAnswer()];
            case 2:
                answer = _a.sent();
                return [4 /*yield*/, conn.setLocalDescription(answer)];
            case 3:
                _a.sent();
                console.log("answering...", answer);
                socket.emit("answer", room_id, answer);
                return [2 /*return*/];
        }
    });
}); });
function addCandidate(candidate) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("Adding candidat...", candidate);
                    return [4 /*yield*/, conn.addIceCandidate(candidate)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.error('Error adding received ice candidate', e_1, candidate);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
conn.addEventListener('connectionstatechange', function (_) {
    console.log("Conneciton state changed: " + conn.connectionState);
});
var btnStart = document.getElementById("btnStart");
btnStart.onclick = function makeCall() {
    return __awaiter(this, void 0, void 0, function () {
        var offer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    btnStart.disabled = true;
                    return [4 /*yield*/, conn.createOffer()];
                case 1:
                    offer = _a.sent();
                    return [4 /*yield*/, conn.setLocalDescription(offer)];
                case 2:
                    _a.sent();
                    console.log("sending offer...", offer);
                    socket.emit("offer", room_id, offer);
                    return [2 /*return*/];
            }
        });
    });
};
