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

    this.invalidated$ = session.changes$.pipe(
      filter(f => f.indexOf(handle) > -1),
      mapTo(this),
      publish(),
      refCount()
    );
  }

  ask(method, ...args) {
    return defer(() =>
      this.session.ask({
        method: method,
        handle: this.handle,
        params: args,
        qClass: this.qClass
      })
    );
  }
}

// // handle request id generator
// this.seqGen = (function*() {
//   var index = 1;
//   while (true) yield index++;
// })();

// // Subject for request methods; expects [methodName: string, args: [], handleRequestId: int]
// this.requests$ = new Subject();

// // Response thread
// this.responses$ = this.requests$.pipe(
//   // Get the raw responses from the socket
//   mergeMap(([method, args, handleRequestId]) =>
//     this.session
//       .ask({
//         method: method,
//         handle: this.handle,
//         params: args
//       })
//       .pipe(
//         map(response => ({
//           response,
//           handleRequestId,
//           method
//         }))
//       )
//   ),
//   // Group the responses by the method called
//   groupBy(r => r.method),
//   // Transform the method responses individually, then merge back in
//   mergeMap(methodResp$ =>
//     // Use scan logic to handle delta mode patching if applicable for each method
//     methodResp$.pipe(
//       scan((acc, curr) => {
//         // if delta logic....

//         // no delta
//         return curr;
//       }, {})
//     )
//   ),
//   publish() // is this necessary? would it be better to move this logic into the session?
// );

// this.responses$.connect();

// // Generate a handle request id
// const handleRequestId = this.seqGen.next().value;

// return defer(() => {
//   // Listen for the response
//   const response$ = this.responses$.pipe(
//     filter(resp => resp.handleRequestId === handleRequestId),
//     map(resp => resp.response),
//     take(1)
//   );

//   // Send the request
//   this.requests$.next([method, args, handleRequestId]);

//   // Return the response
//   return response$;
// });
