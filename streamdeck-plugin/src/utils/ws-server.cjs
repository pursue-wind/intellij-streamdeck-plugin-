const WebSocket = require("ws")

class WsServer {
    constructor(_port, _callback) {
        this.wss = new WebSocket.Server({port: _port});
        this.cb = _callback;
    }

    send() {
        this.wss.on('connection', (ws) => {
            console.log('New client connected');
            ws.on('message', (message) => {
                console.log(`Received message => ${message}`);
                ws.send(`Server received: ${message}`);
                this.cb(message);
            });
            ws.on('close', () => {
                console.log('Client has disconnected');
            });
            ws.send('Welcome to the WebSocket server');
        });
        console.log('WebSocket server is running on ws://localhost:21421');
    }
}

exports.WsServer = WsServer;

new WsServer(21421, (msg) => {
    console.log(msg)
}).send()