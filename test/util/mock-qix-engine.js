var { WebSocket, Server} = require("mock-socket");

function mockEngine() {
    var stamp = Date.now();
    var url = `ws://127.0.0.1:4848/${stamp}`;
    const server = new Server(url);
    const ws = new WebSocket(url);
    return {server, ws};
}

module.exports = mockEngine;