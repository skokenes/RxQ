import connectWS from "./connect/connectWS";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/observable/from";
import "rxjs/add/observable/throw";

import { Subject } from "rxjs/Subject";
import Handle from "./qix-handles/handle";
import { publishLast, refCount, bufferToggle, take,
mergeMap, merge, concatMap, filter, pluck, distinctUntilChanged,
skip, withLatestFrom, map, skipUntil, publishReplay, startWith, mapTo } from "rxjs/operators";

export default class Session {
    constructor(config, opts = {}) {
        const session = this;
        const suspended$ = typeof opts.suspended$ != "undefined" ? Observable.from(opts.suspended$).pipe(startWith(false)) : Observable.of(false); 

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
            });
        }).pipe(
            publishLast(),
            refCount()
        );

        this.wsOpened = wsOpened;

        session.$$.seqGen = function* () {
            var index = 1;
            while(true) yield index++;
        }();

        // Stream of requests that get sent to engine
        session.requestsInput = new Subject();

        // Buffer requests until WS opens, then merge with subsequent requests
        session.requests = session.requestsInput.pipe(
            bufferToggle(Observable.of(true), ()=>wsOpened),
            take(1), // prevents it from continuing to buffer after wsOpen 
            mergeMap(m=>Observable.from(m)),
            merge(session.requestsInput.pipe(skipUntil(wsOpened)))
        );
            
        
        // Stream of responses
        session.responses = wsOpened.pipe(
            concatMap(ws=>Observable.create(function(observer) { 
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
            })),
            publishReplay(),
            refCount()
        );
            
        
        
        // Changes
        const changesIn$ = session.responses.pipe(
            filter(f=>f.hasOwnProperty("change")),
            pluck("change")
        );
        
        const bufferOpen$ = suspended$.pipe(
            distinctUntilChanged(),
            filter(f=>f)
        );
        
        const bufferClose$ = suspended$.pipe(
            distinctUntilChanged(),
            filter(f=>!f),
            skip(1)
        );
        
        const bufferedChanges$ = changesIn$.pipe(
            bufferToggle(bufferOpen$, ()=>bufferClose$),
            map(arr=>arr.reduce((prev,cur)=>{
                return prev.concat(cur);
            },[]))
        );
        
        session.changes = changesIn$.pipe(
            withLatestFrom(suspended$,(changeList,suspendedState)=>suspendedState ? [] : changeList),
            merge(bufferedChanges$)
        );

        // Hook up request pipeline to execute
        session.requests.pipe(
            map(r=>JSON.stringify(r)),
            withLatestFrom(wsOpened)
        )
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

        return session.responses.pipe(
            filter(f=>f.id === requestId),
            mergeMap(m=>{
                if(m.hasOwnProperty("error")) {
                    return Observable.throw(m.error);
                }
                else {
                    return Observable.of(m)
                }
            }),
            map(m=>m.result),
            take(1)
        );
            
    }

    global() {
        return this.wsOpened.pipe(
            mapTo(new Handle(this, -1, "Global")),
            take(1)
        );
    }
}