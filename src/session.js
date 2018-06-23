import {
  Observable,
  Subject,
  BehaviorSubject,
  of as $of,
  throwError as $throw,
  merge,
  concat
} from "rxjs";

import {
  groupBy,
  partition,
  publishLast,
  refCount,
  map,
  withLatestFrom,
  publish,
  filter,
  mergeMap,
  concatMap,
  take,
  mapTo,
  distinctUntilChanged,
  bufferToggle,
  pluck,
  skip,
  switchMap,
  takeUntil,
  ignoreElements,
  tap,
  shareReplay,
  scan
} from "rxjs/operators";

import Handle from "./handle";
import connectWS from "./util/connectWS";
import { applyPatch } from "fast-json-patch";

export default class Session {
  constructor(config) {
    const session = this;

    // closed signal
    this.closed$ = new Subject();

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

    // On close signal, execute side effect to close the websocket
    this.closed$
      .pipe(
        withLatestFrom(ws$),
        take(1)
      )
      .subscribe(([close, ws]) => ws.close());

    // WebSocket close events
    const wsClose$ = ws$.pipe(
      switchMap(ws =>
        Observable.create(observer => {
          ws.addEventListener("close", evt => {
            observer.next(evt);
            observer.complete();
          });
        })
      ),
      // Side effects when websocket gets closed
      tap(() => {
        // complete the requests stream
        requests$.complete();
        // complete the suspended stream
        suspended$.complete();
      })
    );

    // Requests
    const requests$ = new Subject();

    // Hook in request pipeline
    requests$
      .pipe(
        withLatestFrom(ws$),
        takeUntil(wsClose$)
      )
      .subscribe(([req, ws]) => {
        const request = {
          id: req.id,
          handle: req.handle,
          method: req.method,
          params: req.params
        };

        // Set delta if necessary
        if (typeof config.delta === "object") {
          const overrides = config.delta[req.qClass] || [];
          if (overrides.indexOf(req.method) > -1) {
            request.delta = true;
          }
        } else if (config.delta === true) {
          request.delta = true;
        }

        ws.send(JSON.stringify(request));
      });

    // Responses
    const responses$ = ws$.pipe(
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

    // Link responses with requests
    const responsesWithRequest$ = requests$.pipe(
      // this prevents errors from going through the delta processing chain. is that appropriate?
      filter(response => !response.hasOwnProperty("error")),
      mergeMap(req =>
        responses$.pipe(
          filter(response => req.id === response.id),
          take(1),
          map(response => ({
            request: req,
            response: response
          }))
        )
      )
    );

    // Responses with errors
    const errorResponses$ = responses$.pipe(
      filter(resp => resp.hasOwnProperty("error"))
    );

    // Split direct responses from delta responses
    const [directResponse$, deltaResponses$] = responsesWithRequest$.pipe(
      filter(reqResp => !reqResp.response.hasOwnProperty("error")),
      partition(reqResp => !reqResp.response.delta)
    );

    // Apply JSON Patching to delta responses
    const deltaResponsesCalculated$ = deltaResponses$.pipe(
      groupBy(
        reqResp => `${reqResp.request.handle} - ${reqResp.request.method}`
      ),
      mergeMap(grouped$ =>
        grouped$.pipe(
          scan(
            (acc, reqResp) => {
              const { response } = reqResp;
              const resultKeys = Object.keys(response.result);
              return {
                ...reqResp,
                response: {
                  ...reqResp.response,
                  result: resultKeys.reduce((patchedResult, key) => {
                    const currentPatches = response.result[key];
                    // fix for enigma.js root path which is out of compliance with JSON-Pointer spec used by JSON-Patch spec
                    // https://tools.ietf.org/html/rfc6902#page-3
                    // https://tools.ietf.org/html/rfc6901#section-5
                    const transformedPatches = currentPatches.map(
                      patch =>
                        patch.path === "/" ? { ...patch, path: "" } : patch
                    );
                    return {
                      ...patchedResult,
                      [key]: applyPatch(patchedResult[key], transformedPatches)
                        .newDocument
                    };
                  }, acc.response.result)
                }
              };
            },
            {
              response: {
                result: {}
              }
            }
          )
        )
      )
    );

    // Merge the direct and delta responses back together and parse them
    const mappedResponses$ = merge(
      directResponse$.pipe(map(reqResp => reqResp.response)),
      deltaResponsesCalculated$.pipe(map(reqResp => reqResp.response))
    ).pipe(
      map(response => {
        const result = response.result;
        const resultKeys = Object.keys(result);
        if (
          result.hasOwnProperty("qReturn") &&
          result.qReturn.hasOwnProperty("qHandle")
        ) {
          return {
            id: response.id,
            result: new Handle(
              this,
              result.qReturn.qHandle,
              result.qReturn.qType
            )
          };
        } else if (resultKeys.length === 1) {
          return {
            id: response.id,
            result: result[resultKeys[0]]
          };
        } else {
          return response;
        }
      })
    );

    // Publish response stream
    const finalResponse$ = merge(mappedResponses$, errorResponses$).pipe(
      publish()
    );

    // Connect the response stream
    const finalResponseSub = finalResponse$.connect();

    // Changes
    const changesIn$ = responses$.pipe(
      filter(f => f.hasOwnProperty("change")),
      pluck("change")
    );

    // Buffer changes during suspends
    const changes$ = changesIn$.pipe(bufferInvalids(suspended$));

    // Session Notifications
    const notifications$ = merge(
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
      finalResponse$,
      changes$,
      suspended$,
      notifications$,
      delta
    });
  }

  ask(action) {
    const requestId = this.seqGen.next().value;

    const request = {
      id: requestId,
      jsonrpc: "2.0",
      handle: action.handle,
      method: action.method,
      params: action.params,
      qClass: action.qClass
    };

    this.requests$.next(request);

    return this.finalResponse$.pipe(
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
    );
  }

  global() {
    const globalHandle = new Handle(this, -1, "Global");

    // ask for a sample call to test that we are authenticated properly, then either pass global or pass the error
    return this.ws$.pipe(
      switchMap(() =>
        this.ask({
          handle: -1,
          method: "GetUniqueID",
          params: [],
          qClass: "Global"
        })
      ),
      mapTo(globalHandle),
      publishLast(),
      refCount()
    );
  }

  close() {
    this.closed$.next(null);
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
