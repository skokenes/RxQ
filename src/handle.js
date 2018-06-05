import { defer, Subject } from "rxjs";
import {
  filter,
  mapTo,
  publish,
  refCount,
  map,
  take,
  mergeMap,
  groupBy,
  scan
} from "rxjs/operators";

export default class Handle {
  constructor(session, handle, qClass) {
    this.session = session;
    this.handle = handle;
    this.qClass = qClass;

    // Sequence generator
    this.seqGen = (function*() {
      var index = 1;
      while (true) yield index++;
    })();

    // Subject for request methods
    this.requests$ = new Subject();
    // take in [method, args, handleRequestId]

    // History of responses?
    this.responses$ = this.requests$.pipe(
      mergeMap(([method, args, handleRequestId]) =>
        this.session
          .ask({
            method: method,
            handle: this.handle,
            params: args
          })
          .pipe(
            map(response => ({
              response,
              handleRequestId,
              method
            }))
          )
      ),
      groupBy(r => r.method),
      mergeMap(methodResp$ =>
        methodResp$.pipe(
          scan((acc, curr) => {
            // if delta logic....

            // no delta
            return curr;
          }, {})
        )
      ),
      publish() // work on this...
    );

    this.responses$.connect();

    this.invalidated$ = session.changes$.pipe(
      filter(f => f.indexOf(handle) > -1),
      mapTo(this),
      publish(),
      refCount()
    );
  }

  ask(method, ...args) {
    // Generate a handle request id
    const handleRequestId = this.seqGen.next().value;

    return defer(() => {
      // Listen for the response
      const response$ = this.responses$.pipe(
        filter(resp => resp.handleRequestId === handleRequestId),
        map(resp => resp.response),
        take(1)
      );

      // Send the request
      this.requests$.next([method, args, handleRequestId]);

      // Return the response
      return response$;
    });
    // return defer(() =>
    //   this.session.ask({
    //     method: method,
    //     handle: this.handle,
    //     params: args
    //   })
    // );
  }
}
