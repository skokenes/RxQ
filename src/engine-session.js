import * as Rx from "rxjs";
import * as qixSpecs from "./specs/3.1/jsonspec";
console.log(qixSpecs);

export default class EngineSession {
    constructor(config) {
        this.prop = "my property";
        this.Global = {};
        const handle = -1;
        const url = config.host;
        const seqGen = seqId();

        window.testCalls = this.Global;
        
        Object.keys(qixSpecs.default.structs.Global).forEach(e=> {
            const curSpec = qixSpecs.default.structs.Global[e];
            const args = curSpec.In.map(m=>m.Name);
            this.Global[e] = (...args) => {
                //console.log(args);
                return wsOpen
                .mergeMap(ws=>{
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
        

        const seedMsg = {
            "method": "ProductVersion",
            "handle": handle,
            "params": [],
            "id": seqGen.next().value,
            "jsonrpc": "2.0"
        };
         // Open the websocket - keep it hot because we only want to open it once
        const wsOpen = Rx.Observable.create((observer) => {
            const ws = new WebSocket(url);
            ws.addEventListener("open",function() {
                ws.send(JSON.stringify(seedMsg));
                observer.next(ws);
                observer.complete();
            })
        })
        .publishLast()
        .refCount();

        const wsTrafficIn = wsOpen
            .mergeMap(ws => Rx.Observable.create((observer)=>{
                ws.addEventListener("message",function(e) {
                    observer.next(e);
                })
            }))
            .map(m => JSON.parse(m.data));
        
        const wsPassed = wsTrafficIn
            .do(d=>console.log("wsPassed"))
            .filter(f => f.method === "OnAuthenticationInformation" && !f.params.mustAuthenticate)
            .mapTo(true)
            .take(1);
        
        return wsPassed.mapTo(this);
        


        //return wsPassed;
        
        //return 
        
    }
};

/*
{
    "method": "ProductVersion",
    "handle": -1,
    "params": [],
    "id": ++self.seqid,
    "jsonrpc": "2.0"
}
*/

function* seqId() {
    var index = 0;
    while(true) yield index++;
}