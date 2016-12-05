import { Observable } from "rxjs";
import nonLiftedOperators from "./nonLiftedOperators";
import QixObservable from "./QixObservable";
import extendPrototype from "..//util/qix-extend-prototype";
import outputTypes from "../util/qix-obs-types";
import QixField from "../qix-classes/qix-field";

class FieldObservable extends QixObservable {

    constructor(source) {
        super();
        if(typeof source != "undefined") {
            this.source = Observable.create(subscriber=>{
                source.subscribe(s=>{
                    if(s instanceof QixField) {
                        subscriber.next(s);
                    }
                    else {
                        subscriber.error(new Error("Data type mismatch: Emitted value is not an instance of QixField"));
                    }
                    
                }, err=> {
                    subscriber.error(err);
                });
            });
        }
    }

    lift(operator) {
        const operatorName = operator.constructor.name;
        const operatorCheck = operatorName.slice(0,1).toLowerCase() + operatorName.slice(1,operatorName.indexOf("Operator"));

        // If operator is on list, lift it. otherwise, return basic observable
        const observable = nonLiftedOperators.indexOf(operatorCheck) < 0 ? new FieldObservable() : new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }

    qProperties() {
        return this.mergeMap(q=>q.properties$);
    }

    qInvalidated() {
        return this
            .mergeMap(q=>q.invalidated$)
            .let(o=>new FieldObservable(o));
    }

}

// Add in QIX operators
extendPrototype(FieldObservable,"Field");

// Override any properties that should return observable sub classes
const outputs = outputTypes.Field;
const qObs = {
};

outputs.forEach(e=>{
    const methodName = "q" + e.method;
    const methodNameOrig = e.method;
    const obsClass = qObs[e.obsType];
    FieldObservable.prototype[methodName] = function(...args) {
        return this
            .mergeMap(e=>e[methodNameOrig](...args))
            .let(o=>new obsClass(o));
    };
});


export default FieldObservable;