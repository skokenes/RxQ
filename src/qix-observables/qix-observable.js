import { Observable } from "rxjs";
import nonLiftedOperators from "./non-lifted-operators";
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
        const operatorName = operator.constructor.name;
        const operatorCheck = operatorName.slice(0,1).toLowerCase() + operatorName.slice(1,operatorName.indexOf("Operator"));

        // If operator is on list, lift it. otherwise, return basic observable
        const observable = nonLiftedOperators.indexOf(operatorCheck) < 0 ? new curClass(undefined, this.temp) : new Observable();
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

        /*
        
        if(this.temp === "cold") {
            return resp;
        }
        else if(this.temp === "warm") {
            return resp
                .publishReplay(1)
                .refCount();
        }
        else if(this.temp === "hot") {
            const hotRequest = resp.publishReplay(1);
            hotRequest.connect();
            return hotRequest;
        }
        */
    }
}

export default QixObservable;