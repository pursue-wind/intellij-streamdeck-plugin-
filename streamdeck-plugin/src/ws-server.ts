import * as WebSocket from "ws";


export class WsServer {
    private readonly cb: (message: string) => void;
    private s: WebSocket.Server

    constructor(port: number, callback: (message: string) => void) {
        this.cb = callback
        this.s = new WebSocket.Server({port: port});
    }

    public send() {
        // 创建一个WebSocket服务器实例，监听21421端口
        this.s.on('connection', (ws: WebSocket) => {
            console.log('New client connected');

            // 当接收到消息时，发送回去
            ws.on('message', (message: string) => {
                console.log(`Received message => ${message}`);
                ws.send(`Server received: ${message}`);

                this.cb(message)
            });

            // 当连接关闭时
            ws.on('close', () => {
                console.log('Client has disconnected');
            });

            // 发送欢迎信息
            ws.send('Welcome to the WebSocket server');
        });

        console.log('WebSocket server is running on ws://localhost:21421');

    }
}


