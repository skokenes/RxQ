import connectUrl from "./util/qix-connect-string";
import connectOptions from "./util/qix-connect-options";

export default function connectWS(config) {
    const IS_NODE = typeof process !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]";

    // ws 1.0.1 breaks in browser. This will fallback to browser versions correctly
    let WebSocket = global.WebSocket || global.MozWebSocket;

    if (IS_NODE) {
        try {
            WebSocket = require('ws');
        } catch (e) { }
    };

    const url = connectUrl(config);
    const options = connectOptions(config);

    const ws = IS_NODE ? new WebSocket(url,null,options) : new WebSocket(url);

    return ws;
};