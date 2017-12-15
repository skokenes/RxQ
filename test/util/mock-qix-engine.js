var { WebSocket, Server} = require("mock-socket");

function mockEngine() {
    var stamp = Date.now();
    var url = `ws://127.0.0.1:4848/${stamp}`;
    const server = new Server(url);
    const ws = new WebSocket(url);

    server.on("message", (msg) => {

        const { id } = JSON.parse(msg);

        server.send(JSON.stringify({
            "jsonrpc": "2.0",
            "id": id,
            "result": {
              "foo": "bar"
            }
        }))
    });

    return {server, ws};

}

module.exports = mockEngine;