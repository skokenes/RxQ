import * as Rx from "rxjs";

export default class Connection {
    constructor(config) {
        // This will only work for DOM websocket; will have to do custom implementation for Node where you may want to pass headers
        return Rx.Observable.webSocket(config.host);
    }
};