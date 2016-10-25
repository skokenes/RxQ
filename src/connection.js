import connectUrl from "./util/qix-connect-string";
import connectOptions from "./util/qix-connect-options";
import { Observable } from "rxjs";

export default class Connection {
    constructor(config) {
        
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

        // Open the websocket - keep it hot because we only want to open it once
        const wsOpen = Observable.create((observer) => {
            const ws = IS_NODE ? new WebSocket(url,null,options) : new WebSocket(url);

            // Patch node ws for remove event listener
            if(IS_NODE) {
                ws.removeEventListener = (type,handler) => {
                    return ws.removeListener(type,handler);
                }
            };

            ws.addEventListener("open",function() {
                // Shoot off a seed message to get initial response from server
                const seedMsg = {
                    "method": "ProductVersion",
                    "handle": -1,
                    "params": [],
                    "id": -1,
                    "jsonrpc": "2.0"
                };
                ws.send(JSON.stringify(seedMsg));

                // Pass on the websocket and complete
                observer.next(ws);
                observer.complete();
            })
        })
        .publishLast()
        .refCount();
        
        // Log websocket traffic
        const wsTrafficIn = wsOpen
            .mergeMap(ws => Observable.create((observer)=>{
                ws.addEventListener("message",function(e) {
                    observer.next(e);
                })
            }))
            .map(m => JSON.parse(m.data));
        
         // Pass when this thing is ready
        const wsPassed = wsTrafficIn
            .filter(f => f.method === "OnAuthenticationInformation" && !f.params.mustAuthenticate)
            .mapTo(true)
            .take(1)
            .publishLast()
            .refCount();
        
        return {wsOpen,wsTrafficIn,wsPassed};

    }
};