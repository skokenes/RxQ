import { defer } from "rxjs/Observable/defer";
import { filter, mapTo, startWith, debounceTime, publishReplay, refCount } from "rxjs/operators";

export default class Handle {
    constructor(session, handle, qClass) {
        this.session = session;
        this.handle = handle;
        this.qClass = qClass;

        this.invalidated$ = session.changes$.pipe(
            filter(f => f.indexOf(handle) > -1),
            mapTo(this),
            startWith(this),
            /*
                debounceTime added as temp patch for issue with how QIX engine treats `getObject` vs. `createSessionObject`.
                On `getObject`, no initial change event is provided, so we have to use a startWith to initialize an invalidation event.
                On `createSessionObject`, an initial change event is provided. The `startWith` call will then trigger 2 invalidation events.
                The debounceTime(0) removes this double call that happens for session objects. Would prefer that Qlik update engine so that
                both methods behave the same way.
            */
            debounceTime(0),
            publishReplay(1),
            refCount()
        );
    }

    ask(method, ...args) {
        return defer(() => this.session.ask({
            method: method,
            handle: this.handle,
            params: args
        }));
    }
}