import * as qixSpecs from "./specs/3.1/jsonspec";
import { Observable } from "rxjs";

const classes = qixSpecs.default.structs;
const classNames = Object.keys(classes);

const engine = classNames.reduce((acc,curr) => {
    const methods = classes[curr];
    const methodNames = Object.keys(methods);
    
    acc[curr] = methodNames.reduce((iAcc,iCurr) => {
        const method = methods[iCurr];
        iAcc[iCurr] = (ws,handle,id,...args) => {
            return Observable.create((observer) => {
                const msgFn = (evt) => {
                    observer.next(evt);
                }
                // Add listener
                ws.addEventListener("message",msgFn);

                // Send message
                const msg = {
                    "method": iCurr,
                    "handle": handle,
                    "params": args,
                    "id": id,
                    "jsonrpc": "2.0"
                };
                ws.send(JSON.stringify(msg));

                return () => ws.removeEventListener("message",msgFn);
            })
            .map(m => JSON.parse(m.data))
            .filter(f => f.id === id)
            .map(m => m.result)
            .take(1);
        };
        return iAcc;
    },{});

    return acc;
},{});

export default engine;