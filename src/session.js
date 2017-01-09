import connectWS from "./connectWS";
import { Observable, Subject } from "rxjs";
import Global from "./qix-handles/global";

export default class Session {
    constructor(config, temp) {
        const session = this;

        session.temp = ["cold", "warm", "hot"].indexOf(temp) > -1 ? temp : "cold";

        session.config = config;
        
        // Privates
        session.$$ = {};

        const wsOpened = Observable.create(function(observer) {
            const ws = connectWS(config);

            ws.addEventListener("open", function(evt) {
                observer.next(ws);
                observer.complete();
            });
            // how to pass down error when opening fails?
            ws.addEventListener("error", function(err) {
                console.log("caught an error",err);
            });
        })
        .publishLast()
        .refCount();

        
        

        session.$$.seqGen = function* () {
            var index = 1;
            while(true) yield index++;
        }();

        // Stream of requests that get sent to engine
        session.requestsInput = new Subject();

        // Buffer requests until WS opens, then merge with subsequent requests
        session.requests = session.requestsInput
            .bufferToggle(Observable.of(true), ()=>wsOpened)
            .take(1) // prevents it from continuing to buffer after wsOpen 
            .mergeMap(m=>Observable.from(m))
            .merge(session.requestsInput.skipUntil(wsOpened));
        
        // Stream of responses
        session.responses = wsOpened
            .mergeMap(ws=>Observable.create(function(observer) {
                ws.addEventListener("message", function(evt) {
                    const response = JSON.parse(evt.data);
                    observer.next(response);
                });

                // error handling?
                ws.addEventListener("error", function(err) {
                    observer.error(err);
                });

                // close handling?
                ws.addEventListener("close", function() {
                    observer.complete();
                });
            }));
        
        // Changes
        session.changes = session.responses
            .filter(f=>f.hasOwnProperty("change"))
            .pluck("change");

        // Hook up request pipeline to execute
        session.requests
            .map(r=>JSON.stringify(r))
            .withLatestFrom(wsOpened)
            .subscribe(([req, ws])=>{
                ws.send(req);
            });
    }

    ask(action) {
        const session = this;

        const requestId = session.$$.seqGen.next().value;

        const baseRequest = {
            id: requestId,
            jsonrpc: "2.0"
        };

        const request = Object.assign(baseRequest, action);

        session.requestsInput.next(request);

        return session.responses
            .filter(f=>f.id === requestId)
            .mergeMap(m=>{
                if(m.hasOwnProperty("error")) {
                    return Observable.throw(m.error);
                }
                else {
                    return Observable.of(m)
                }
            })
            .map(m=>m.result)
            .take(1);
    }

    global() {
        return new Global(this);
    }
}