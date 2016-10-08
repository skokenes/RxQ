import * as Rx from "rxjs";
import * as qixSpecs from "./specs/3.1/jsonspec";

const engine = {};

const defs = qixSpecs.default.structs;
const defKeys = Object.keys(defs);

const globalDefs = defs.Global;
const nonGlobalDefKeys = defKeys.filter(f=>f!="Global");

engine.Global = Object.keys(globalDefs)
    .reduce((prev,m)=>{
        const curSpec = globalDefs[m];
        const args = curSpec.In.map(k=>k.Name);
        prev[m] = (ws,id,...args) => {

            const request = {
                "method": m,
                "handle": -1,
                "params": args,
                "id": id,
                "jsonrpc": "2.0"
            };

            

            // Observable from event
            const wsMsg = Rx.Observable.fromEventPattern(
                function add(h) {
                    ws.addEventListener("message",h);
                },
                function remove(h) {
                    ws.removeEventListener("message",h);
                }
            );


            // return observable of response
            return Rx.Observable.of(1)
                .mergeMap(m=>wsMsg)
                .do(d=>ws.send(JSON.stringify(request)))
                .filter(f=>f.id === id)
                .take(1);
        };
        return prev;
    },{})

export default engine;