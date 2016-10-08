import * as Rx from "rxjs";

window.Rx = Rx;

export default class ManualConnection {
    constructor(config) {
        
        // Open the websocket - keep it hot because we only want to open it once
        const wsOpen = Rx.Observable.create((observer) => {
            const ws = new WebSocket(config.host);
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
            .mergeMap(ws => Rx.Observable.create((observer)=>{
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