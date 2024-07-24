const WebSocket = require("ws")

const socket = new WebSocket("ws://127.0.0.1:21420?name=Underscore")
socket.onopen = (event) => {
    console.log("WebSocket 连接已建立");
    console.log(event);
};
socket.onmessage = (event)  => {
    console.log("接收到消息："  + event.data);
};

socket.onerror =(event) => {
    console.log("WebSocket连接出错，等待5秒后重新连接");

};

socket.onclose = (event) => {
    console.log("WebSocket连接关闭");
};

const socket2 = new WebSocket("ws://127.0.0.1:21420?name=CamelCase")
socket2.onopen = (event) => {
    console.log("WebSocket 连接已建立");
    console.log(event);
};
socket2.onmessage = (event)  => {
    console.log("接收到消息："  + event.data);
};

socket2.onerror =(event) => {
    console.log("WebSocket连接出错，等待5秒后重新连接");

};

socket2.onclose = (event) => {
    console.log("WebSocket连接关闭");
};
