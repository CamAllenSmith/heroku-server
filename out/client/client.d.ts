declare const socket: any;
declare const room_id = "12345678";
declare const conn: RTCPeerConnection;
declare function DataChannelStateChange(label: string, channel: RTCDataChannel): () => void;
declare const output_channel: RTCDataChannel;
declare const outputStateChange: () => void;
/** Called upon connecting to remote peer. Resolves the "connect" promise so everything waiting on connection can be released. */
declare let onConnect: (value?: unknown) => void;
declare const connect: Promise<unknown>;
declare function addCandidate(candidate: RTCIceCandidate): Promise<void>;
declare const btnStart: HTMLButtonElement;
