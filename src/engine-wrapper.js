import * as qixSpecs from "./specs/3.1/jsonspec";

const classes = qixSpecs.default.structs;
const classNames = Object.keys(classes);

const engine = classNames.reduce((acc,curr) => {
    const methods = classes[curr];
    const methodNames = Object.keys(methods);
    
    acc[curr] = methodNames.reduce((iAcc,iCurr) => {
        const method = methods[iCurr];
        iAcc[iCurr] = (session,handle,id,...args) => {
            const wsOpen = session.obs.wsOpen;
            const wsPassed = session.obs.wsPassed;
            const wsTrafficIn = session.obs.wsTrafficIn;

            return wsPassed   
                .withLatestFrom(wsOpen,(pass,ws)=>ws)
                .mergeMap((ws)=>{
                    const msg = {
                        "method": iCurr,
                        "handle": handle,
                        "params": args,
                        "id": id,
                        "jsonrpc": "2.0"
                    };
                    ws.send(JSON.stringify(msg));
                    return wsTrafficIn
                        .filter(f => f.id === id)
                        .map(m=>m.result)
                        .take(1);
                });
        }
        return iAcc;
    },{});

    return acc;
},{});

export default engine;