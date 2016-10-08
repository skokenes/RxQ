import * as Rx from "rxjs";
import * as qixSpecs from "./specs/3.1/jsonspec";
import Connection from "./connection";
import ManualConnection from "./manual-connection";

export default class EngineSession {
    constructor(config) {
        this.Global = {};
        const handle = -1;
        const seqGen = seqId();

        // Map global api calls (put into function or class?)
        Object.keys(qixSpecs.default.structs.Global).forEach(e=> {
            const curSpec = qixSpecs.default.structs.Global[e];
            const args = curSpec.In.map(m=>m.Name);
            this.Global[e] = (...args) => {
                return wsObs.wsPassed   
                .withLatestFrom(wsObs.wsOpen,(pass,ws)=>ws)
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
                    return wsObs.wsTrafficIn
                        .filter(f => f.id === id)
                        .take(1);
                });
            };
        });

        //Map other API calls (put into function?)
        Object.keys(qixSpecs.default.structs).filter(f=>f!="Global").forEach(e=>{
            const curClass = qixSpecs.default.structs[e];
            this[e] = Object.keys(curClass).reduce((acc,curr) => {
                const curSpec = curClass[curr];
                const args = curSpec.In.map(m=>m.Name);
                acc[curr] = (inputHandle,...args) => { // should this take static handle or observable for handle?
                    return wsObs.wsPassed
                    .withLatestFrom(wsObs.wsOpen,(pass,ws)=>ws)
                    .mergeMap((ws)=> {
                        const id = seqGen.next().value;
                        const msg = {
                            "method": curr,
                            "handle": inputHandle,
                            "params": args,
                            "id": id,
                            "jsonrpc": "2.0"
                        };
                        ws.send(JSON.stringify(msg));
                        return wsObs.wsTrafficIn
                            .filter(f => f.id === id)
                            .take(1);
                    });
                };
                return acc;
            },{});
        });

        //const wsTraffic = new Connection(config);
        const wsObs = new ManualConnection(config);
        
        return wsObs.wsPassed.mapTo(this);
        
        
    }
};

function* seqId() {
    var index = 1;
    while(true) yield index++;
}