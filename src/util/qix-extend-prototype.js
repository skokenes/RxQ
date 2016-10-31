import { Observable } from "rxjs";
import engineWrapper from "../engine-wrapper";


export default function(proto,type) {
    const methods = engineWrapper[type];
    const methodNames = Object.keys(methods);

    methodNames.forEach(methodName => {
        const method = methods[methodName];
        const methodCamel = methodName.slice(0,1).toLowerCase() + methodName.slice(1);
        
        proto.prototype[methodCamel] = function(...args) {
            const responseObservable = this
                .mergeMap(e=>e[methodName](...args));
            
            // Cast to normal observable (is there a way to change this?)
            return Observable.of('')
                .mergeMap(()=>responseObservable);
                    // .publishLast().refCount() if we want these hot   
        }
    });
}