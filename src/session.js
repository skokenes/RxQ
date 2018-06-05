import {
  Observable,
  Subject,
  BehaviorSubject,
  of as $of,
  from as $from,
  throwError as $throw,
  merge,
  concat
} from "rxjs";

import {
  publishLast,
  refCount,
  map,
  withLatestFrom,
  publish,
  publishReplay,
  filter,
  mergeMap,
  concatMap,
  take,
  mapTo,
  distinctUntilChanged,
  bufferToggle,
  pluck,
  startWith,
  skip,
  switchMap,
  takeUntil,
  ignoreElements
} from "rxjs/operators";

import Handle from "./handle";
import connectWS from "./util/connectWS";

export default class Session {
  constructor(config) {
    const session = this;

    // delta mode
    const delta = config.delta || false;

    // Suspended changes state
    const suspended$ = new BehaviorSubject(false);

    // Connect WS
    const ws$ = Observable.create(observer => {
      // If they supplied a WebSocket, use it. Otherwise, build one
      if (typeof config.ws !== "undefined") {
        observer.next(config.ws);
        observer.complete();
      } else {
        var ws = connectWS(config);

        ws.addEventListener("open", evt => {
          observer.next(ws);
          observer.complete();
        });
      }

      return;
    }).pipe(
      publishLast(),
      refCount()
    );

    // WebSocket close
    const wsClose$ = ws$.pipe(
      switchMap(ws =>
        Observable.create(observer => {
          ws.addEventListener("close", evt => {
            observer.next(evt);
            observer.complete();
          });
        })
      )
    );

    // Requests
    var requests$ = new Subject();

    // Hook in request pipeline
    requests$
      .pipe(
        map(req => JSON.stringify(req)),
        withLatestFrom(ws$)
      )
      .subscribe(([req, ws]) => ws.send(req));

    // Responses
    var responses$ = ws$.pipe(
      concatMap(ws =>
        Observable.create(observer => {
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
        })
      ),
      publish(),
      refCount()
    );

    // Changes
    const changesIn$ = responses$.pipe(
      filter(f => f.hasOwnProperty("change")),
      pluck("change")
    );

    const bufferOpen$ = suspended$.pipe(
      distinctUntilChanged(),
      filter(f => f)
    );

    const bufferClose$ = suspended$.pipe(
      distinctUntilChanged(),
      filter(f => !f),
      skip(1)
    );

    const bufferedChanges$ = changesIn$.pipe(
      bufferToggle(bufferOpen$, () => bufferClose$),
      map(arr =>
        arr.reduce((prev, cur) => {
          return prev.concat(cur);
        }, [])
      )
    );

    const changes$ = changesIn$.pipe(bufferInvalids(suspended$));

    // Session Notifications
    const notification$ = merge(
      requests$.pipe(
        map(req => ({
          type: "traffic:sent",
          data: req
        }))
      ),
      responses$.pipe(
        map(resp => ({
          type: "traffic:received",
          data: resp
        }))
      ),
      changes$.pipe(
        map(changes => ({
          type: "traffic:change",
          data: changes
        }))
      ),
      suspended$.pipe(
        map(suspend => ({
          type: "traffic:suspend-status",
          data: suspend
        }))
      ),
      wsClose$.pipe(
        map(evt => ({
          type: "socket:close",
          data: evt
        }))
      )
    );

    // Sequence generator
    this.seqGen = (function*() {
      var index = 1;
      while (true) yield index++;
    })();

    Object.assign(this, {
      ws$,
      requests$,
      responses$,
      changes$,
      suspended$,
      notification$
    });
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
      mergeMap(m => {
        if (m.hasOwnProperty("error")) {
          return $throw(m.error);
        } else {
          return $of(m);
        }
      }),
      map(m => m.result),
      take(1)
      // this may need publish replay? currently passing tests...
    );
  }

  global() {
    const globalHandle = new Handle(this, -1, "Global");
    globalHandle.notification$ = this.notification$;

    // ask for a sample call to test that we are authenticated properly, then either pass global or pass the error
    return this.ws$.pipe(
      switchMap(() =>
        this.ask({
          handle: -1,
          method: "GetUniqueID",
          params: []
        })
      ),
      mapTo(globalHandle),
      publishLast(),
      refCount()
    );
  }
}

function bufferInvalids(status$) {
  return function(src$) {
    const values = [];
    const directStream$ = new Observable.create(observer => {
      return src$.pipe(withLatestFrom(status$)).subscribe(
        ([val, status]) => {
          if (status) {
            values.push(...val);
          } else {
            observer.next(val);
          }
        },
        err => observer.error(err),
        () => observer.complete()
      );
    });

    const bufferStream$ = status$.pipe(
      distinctUntilChanged(),
      filter(f => !f),
      map(() => values),
      filter(f => f.length > 0),
      takeUntil(concat(src$.pipe(ignoreElements()), $of(undefined)))
    );

    return merge(directStream$, bufferStream$);
  };
}

/*

session.notification$
- socket
  - open
  - close
- suspended (why would this be on socket? should be session level)
- traffic
  - sent
  - received
  - errors
  - changes
  - suspend status


*/
