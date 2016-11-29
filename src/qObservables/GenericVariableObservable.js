import { Observable } from "rxjs";
import nonLiftedOperators from "./nonLiftedOperators";
import QixObservable from "./QixObservable";
import extendPrototype from "..//util/qix-extend-prototype";
import outputTypes from "../util/qix-obs-types";
import QixGenericVariable from "../qix-classes/qix-generic-variable";

class GenericVariableObservable extends QixObservable {

    constructor(source) {
        super();
        this.source = source
            .mergeMap(m=>{
                if(m instanceof QixGenericVariable) {
                    return Observable.of(m);
                }
                else {
                    return Observable.throw(new Error("Data type mismatch: Emitted value is not instance of QixGenericVariable"));
                }
            });
    }

    lift(operator) {
        const operatorName = operator.constructor.name;
        const operatorCheck = operatorName.slice(0,1).toLowerCase() + operatorName.slice(1,operatorName.indexOf("Operator"));

        // If operator is on list, lift it. otherwise, return basic observable
        const observable = nonLiftedOperators.indexOf(operatorCheck) < 0 ? new GenericVariableObservable() : new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }

    layouts() {
        return Observable.of('')
            .mergeMap(()=>this.mergeMap(q=>q.layout$));
    }

}

// Add in QIX operators for global
extendPrototype(GenericVariableObservable,"GenericVariable");

// Override any properties that should return observable sub classes
const outputs = outputTypes.GenericVariable;
const qObs = {
};

outputs.forEach(e=>{
    const methodName = e.method;
    const methodNameOrig = methodName.slice(0,1).toUpperCase() + methodName.slice(1);
    const obsClass = qObs[e.obsType];
    GenericVariableObservable.prototype[methodName] = function(...args) {
        return this
            .mergeMap(e=>e[methodNameOrig](...args))
            .let(o=>new obsClass(o));
    };
});


export default GenericVariableObservable;