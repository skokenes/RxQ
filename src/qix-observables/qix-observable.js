import { Observable } from "rxjs";
import noncastOperators from "./noncast-operators";
import setObsTemp from "../util/set-obs-temp";

class QixObservable extends Observable {
    constructor(source, type, temp) {
        super();

        this.temp = ["cold", "warm", "hot"].indexOf(temp) > -1 ? temp : "cold";

        if(typeof source != "undefined") {
            const qClass = require("../qix-handles/" + type);

            this.source = Observable.create(subscriber=>{
                source.subscribe(s=>{
                    if(s instanceof qClass) {
                        subscriber.next(s);
                    }
                    else {
                        subscriber.error(new Error("Data type mismatch: Emitted value is not an instance of " + qClass.name));
                    }
                    
                }, err=> {
                    subscriber.error(err);
                });
            });
        }
        else {
            this.source = source;
        }

    }

    // Lift appropriate operators
    lift(operator) {

        const curClass = this.constructor;

        const observable = new curClass(undefined, this.temp);
        observable.source = this;
        observable.operator = operator;
        return observable;
    }

    // Invalidation streams
    qInvalidated() {
        const curClass = this.constructor;

        const resp = this
            .mergeMap(q=>q.invalidated$)
            .let(o=>new curClass(o, this.temp));
        
        return setObsTemp(resp, this.temp);
    }
}


noncastOperators.forEach((operatorName) => {
    QixObservable.prototype[operatorName] = function() {
        var qObs = this;
        var observable = Observable.create(function(observer) {
            qObs.subscribe(s=>observer.next(s),e=>observer.error(e),()=>observer.complete());
        });
        return observable[operatorName](...arguments);
    }
});

export default QixObservable;