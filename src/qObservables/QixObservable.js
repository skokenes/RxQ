import { Observable } from "rxjs";
import nonLiftedOperators from "./nonLiftedOperators";

class QixObservable extends Observable {

    constructor(source) {
        super();
        this.source = source;
    }

    lift(operator) {
        console.log(operator);
        const operatorName = operator.constructor.name;
        const operatorCheck = operatorName.slice(0,1).toLowerCase() + operatorName.slice(1,operatorName.indexOf("Operator"));

        // If operator is on list, lift it. otherwise, return basic observable
        const observable = nonLiftedOperators.indexOf(operatorCheck) < 0 ? new QixObservable() : new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }

    invalidated() {
        return this
            .mergeMap(q=>q.invalidated$);
    }
    
}

export default QixObservable;