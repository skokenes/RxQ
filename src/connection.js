import * as Rx from "rxjs";

export default class Connection {
    constructor(config) {
        this.ws = new WebSocket("ws://sense.axisgroup.com/app/%3Ftransient%3D");
        
        this.wsOpenObs = Rx.Observable.fromEvent(this.ws,"open");

        this.wsMessageObs = Rx.Observable.fromEvent(this.ws,"message");

        this.ws.addEventListener("open", function() {
            console.log("ws opened!");
        });
    }
};