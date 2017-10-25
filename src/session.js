import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { of as $of } from "rxjs/Observable/of";
import { from as $from } from "rxjs/Observable/from";
import { throw as $throw } from "rxjs/Observable/throw";

import { publishLast, refCount, map, withLatestFrom, publishReplay,
filter, mergeMap, concatMap, take, mapTo, distinctUntilChanged,
bufferToggle, pluck, startWith, skip, merge } from "rxjs/operators";

import Handle from "./handle";
import connectWS from "./util/connectWS";

export default class Session {
    constructor(config, opts = {}) {

        var session = this;

        // Suspended changes state
        const suspended$ = typeof opts.suspended$ != "undefined" ? $from(opts.suspended$).pipe(startWith(false)) : $of(false); 
        
        // Connect WS
        const ws$ = Observable.create((observer) => {

            var ws = connectWS(config);

            ws.addEventListener("open", evt => {
                observer.next(ws);
                observer.complete();
            });

        }).pipe(
            publishLast(),
            refCount()
        );

        // Requests
        var requests$ = new Subject();

        // Hook in request pipeline
        requests$.pipe(
            map(req => JSON.stringify(req)),
            withLatestFrom(ws$)
        ).subscribe(([req, ws]) => ws.send(req));

        // Responses
        var responses$ = ws$.pipe(
            concatMap(ws => Observable.create((observer) => {
                ws.addEventListener("message", evt => {
                    const response = JSON.parse(evt.data);
                    observer.next(response);
                });

                ws.addEventListener("error", err => {
                    observer.error(err);
                });

                ws.addEventListener("close", function() {
                    observer.complete();
                });
            })),
            publishReplay(),
            refCount()
        );

        // Changes
        const changesIn$ = responses$.pipe(
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
        
        const changes$ = changesIn$.pipe(
            withLatestFrom(suspended$,(changeList,suspendedState)=>suspendedState ? [] : changeList),
            merge(bufferedChanges$)
        );

        // Sequence generator
        this.seqGen = function* () {
            var index = 1;
            while(true) yield index++;
        }();

        this.ws$ = ws$;
        this.requests$ = requests$;
        this.responses$ = responses$;
        this.changes$ = changes$;
    }

    ask(action) {
        const requestId = this.seqGen.next().value;
        
        const baseRequest = {
            id: requestId,
            jsonrpc: "2.0"
        };

        const request = Object.assign(baseRequest, action);
        
        this.requests$.next(request);

        return this.responses$.pipe(
            filter(r => r.id === requestId),
            mergeMap(m=>{
                if(m.hasOwnProperty("error")) {
                    return $throw(m.error);
                }
                else {
                    return $of(m)
                }
            }),
            map(m=>m.result),
            take(1)
        );
    }

    global() {
        return this.ws$.pipe(
            mapTo(new Handle(this, -1, "Global")),
            publishLast(),
            refCount()
        );
    }
}