import { Observable } from "rxjs/Observable";
import { mergeMap, publishReplay, refCount } from "rxjs/operators";
import Handle from "../../qix-handles/handle.js";

const ask = function(methodName,...args) {
    return function(source$) {
        const apiCall$ = source$.pipe(
            mergeMap(handle=>{
                if(handle instanceof Handle) {
                    return handle.session.ask({
                        handle: handle.handle,
                        method: methodName,
                        params: args
                    });
                }
                else return Observable.throw(new Error("Source value is not a Qix Handle"));
                
            }),
            publishReplay(1),
            refCount()
        );

        return apiCall$;
        
    }
}

export default ask;