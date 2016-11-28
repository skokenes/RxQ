import { Observable } from "rxjs";
import nonLiftedOperators from "./nonLiftedOperators";
import QixObservable from "./QixObservable";
import extendPrototype from "..//util/qix-extend-prototype";
import outputTypes from "../util/qix-obs-types";
import QixGenericMeasure from "../qix-classes/qix-generic-measure";

class GenericMeasureObservable extends QixObservable {

    constructor(source) {
        super();
        this.source = source
            .mergeMap(m=>{
                if(m instanceof QixGenericMeasure) {
                    return Rx.Observable.of(m);
                }
                else {
                    return Rx.Observable.throw(new Error("Data type mismatch: Emitted value is not instance of QixGenericMeasure"));
                }
            });
    }

    lift(operator) {
        const operatorName = operator.constructor.name;
        const operatorCheck = operatorName.slice(0,1).toLowerCase() + operatorName.slice(1,operatorName.indexOf("Operator"));

        // If operator is on list, lift it. otherwise, return basic observable
        const observable = nonLiftedOperators.indexOf(operatorCheck) < 0 ? new GenericMeasureObservable() : new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }

    layouts() {
        return Observable.of('')
            .mergeMap(()=>this.mergeMap(q=>q.layout$));
    }

}

// Add in QIX operators
extendPrototype(GenericMeasureObservable,"GenericMeasure");

// Override any properties that should return observable sub classes
const outputs = outputTypes.GenericMeasure;
const qObs = {
};

outputs.forEach(e=>{
    const methodName = e.method;
    const methodNameOrig = methodName.slice(0,1).toUpperCase() + methodName.slice(1);
    const obsClass = qObs[e.obsType];
    GenericMeasureObservable.prototype[methodName] = function(...args) {
        return this
            .mergeMap(e=>e[methodNameOrig](...args))
            .let(o=>new obsClass(o));
    };
});


export default GenericMeasureObservable;