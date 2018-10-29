import { defer } from "rxjs";
import { filter, mapTo, publish, refCount } from "rxjs/operators";

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
