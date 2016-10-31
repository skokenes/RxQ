import { Observable } from "rxjs";
import nonLiftedOperators from "./nonLiftedOperators";

class QixObservable extends Observable {

    constructor(source) {
        super();
        this.source = source;
    }

    lift(operator) {
        const operatorName = operator.constructor.name;
        const operatorCheck = operatorName.slice(0,1).toUpperCase() + operatorName.slice(1,operatorName.indexOf("Operator"));

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

    layouts() {
        return Observable.of('')
            .mergeMap(()=>this.mergeMap(q=>q.layout$));
    }
    
}

export default QixObservable;