import * as Rx from "rxjs";
import * as qixSpecs from "./specs/3.1/jsonspec";
console.log(qixSpecs);

export default class EngineSession {
    constructor(config) {
        this.Global = {};
        const handle = -1;
        const url = config.host;
        const seqGen = seqId();
        
        // Map global api calls
        Object.keys(qixSpecs.default.structs.Global).forEach(e=> {
            const curSpec = qixSpecs.default.structs.Global[e];
            const args = curSpec.In.map(m=>m.Name);
            this.Global[e] = (...args) => {
                return wsPassed
                .withLatestFrom(wsOpen,(pass,ws)=>ws)
                .mergeMap((ws)=>{
                    const id = seqGen.next().value;
                    const msg = {
                        "method": e,
                        "handle": handle,
                        "params": args,
                        "id": id,
                        "jsonrpc": "2.0"
                    };
                    ws.send(JSON.stringify(msg));
                    return wsTrafficIn
                        .filter(f => f.id === id)
                        .take(1);
                });
            };
        });
        

         // Open the websocket - keep it hot because we only want to open it once
        const wsOpen = Rx.Observable.create((observer) => {
            const ws = new WebSocket(url);
            ws.addEventListener("open",function() {
                // Shoot off a seed message to get initial response from server
                const seedMsg = {
                    "method": "ProductVersion",
                    "handle": handle,
                    "params": [],
                    "id": seqGen.next().value,
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
        
        // Pass on the session object and keep that boy hot too
        const wsPassed = wsTrafficIn
            .filter(f => f.method === "OnAuthenticationInformation" && !f.params.mustAuthenticate)
            .mapTo(this)
            .take(1)
            .publishLast()
            .refCount();
        
        return wsPassed;
        
        
    }
};

function* seqId() {
    var index = 1;
    while(true) yield index++;
}