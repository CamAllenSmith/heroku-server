// @ts-check

// @ts-ignore
const socket = io();


// TODO: prompt on button click, this will uniquely identify the call. probably have the server generated it using a Guid or something
const room_id = "12345678";

console.log("joing room: ", room_id);
socket.emit("room", room_id);


const conn = new RTCPeerConnection({
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        }
    ]
});

conn.addEventListener('icecandidate', event => {
    if (event.candidate) {
        console.log("sending candidate: ", event.candidate);
        socket.emit("candidate", room_id, event.candidate);
    }
});


// #region Data Channel
function DataChannelStateChange(label, channel) {
    return () => console.log(`${label} channel state is: ${channel.readyState}`);
}
const output_channel = conn.createDataChannel("output");
const outputStateChange = DataChannelStateChange("Output", output_channel);
output_channel.onopen = () => {
    outputStateChange();

    output_channel.send("DMs are open bb");
}
output_channel.onclose = outputStateChange;

// RECEIVE CHANNEL
conn.ondatachannel = function (e) {
    console.log("Received Data Channel... ", e);

    e.channel.onmessage = function (m) {
        console.log("Received Data Channel Message... ", m);
    };

    const onStateChange = DataChannelStateChange("Input", e.channel);
    e.channel.onopen = onStateChange;
    e.channel.onclose = onStateChange;
}

// #endregion



// this promise resolves when remote description is set
let onConnect;
const connect = new Promise((resolve, _) => onConnect = resolve);

socket.on("candidate", async (candidate) => {
    console.log("received candidate: ", candidate);

    // might receive candidates prior to connecting (throws error). This is why "connect" promise exists
    await connect;

    addCandidate(candidate);

});


socket.on("offer", async (offer) => {
    console.log("receiving offer...", offer);

    // TODO: if already connected, reject all new offers
    if (conn.remoteDescription) {
        console.error("Already connected to a remote peer... rejecting new offer", offer);
        return;
    }

    await conn.setRemoteDescription(offer);

    const answer = await conn.createAnswer();
    await conn.setLocalDescription(answer);

    console.log("answering...", answer);
    socket.emit("answer", room_id, answer);

});


socket.on("answer", async (answer) => {
    console.log("received answer: ", answer);
    await conn.setRemoteDescription(answer);

    // now resolve promise so cancidates can be added
    onConnect();
});




async function addCandidate(candidate) {
    try {
        console.log("Adding candidat...", candidate);
        await conn.addIceCandidate(candidate);
    } catch (e) {
        console.error('Error adding received ice candidate', e, candidate);
    }
}

conn.addEventListener('connectionstatechange', event => {
    console.log("Conneciton state changed: " + conn.connectionState);
});


/** @type {HTMLButtonElement} */
// @ts-ignore
const btnStart = document.getElementById("btnStart");
btnStart.onclick =  async function makeCall() {

    btnStart.disabled = true;


    const offer = await conn.createOffer();
    await conn.setLocalDescription(offer);


    console.log("sending offer...", offer);
    socket.emit("offer", room_id, offer);


}