import { WsServer } from "./ws-server.js";
import assert from "node:assert";
describe('WebSocket Server', () => {
    let server;
    beforeAll(() => {
        // 创建 WebSocket 服务器实例
        server = new WsServer(21421, (msg) => {
            console.log(msg);
        });
    });
    it('should handle incoming messages', (done) => {
        server.send();
        assert.equal("1", '1');
    });
});
