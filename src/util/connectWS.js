import connectUrl from "./qix-connect-string";
import connectOptions from "./qix-connect-options";

export default function connectWS(config) {
  const IS_NODE =
    typeof process !== "undefined" &&
    Object.prototype.toString.call(global.process) === "[object process]";

  let _WebSocket;

  if (IS_NODE) {
    try {
      _WebSocket = require("ws");
    } catch (e) {}
  } else {
    try {
      _WebSocket = WebSocket;
    } catch (e) {}
  }

  const url = connectUrl(config);
  const options = connectOptions(config);

  if (typeof _WebSocket === "function") {
    const ws = IS_NODE
      ? new _WebSocket(url, null, options)
      : new _WebSocket(url);
    return ws;
  } else {
    throw new Error("WebSocket is not defined");
  }
}
