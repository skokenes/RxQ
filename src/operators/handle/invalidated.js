import { mergeMap, publishReplay, filter, mapTo, startWith, debounceTime } from "rxjs/operators";
import Handle from "../../qix-handles/handle.js";

const invalidated = function() {
    return function(source$) {
        const invalidated$ = source$.pipe(
            mergeMap(handle=>{
                const session = handle.session;
                return session.changes.pipe(
                    filter(f => f.indexOf(handle.handle) > -1),
                    mapTo(handle),
                    startWith(handle),
                    /*
                        debounceTime added as temp patch for issue with how QIX engine treats `getObject` vs. `createSessionObject`.
                        On `getObject`, no initial change event is provided, so we have to use a startWith to initialize an invalidation event.
                        On `createSessionObject`, an initial change event is provided. The `startWith` call will then trigger 2 invalidation events.
                        The debounceTime(0) removes this double call that happens for session objects. Would prefer that Qlik update engine so that
                        both methods behave the same way.
                    */
                    debounceTime(0) 
                );
            }),
            publishReplay(1)
        );
        
        invalidated$.connect();

        return invalidated$;
        
    }
}

export default invalidated;