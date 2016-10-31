import { Observable } from "rxjs";
import nonLiftedOperators from "./nonLiftedOperators";
import QixObservable from "./QixObservable";
import extendPrototype from "../util/qix-extend-prototype";
import outputTypes from "../util/qix-obs-types";
import FieldObservable from "./FieldObservable";
import GenericBookmarkObservable from "./GenericBookmarkObservable";
import GenericDimensionObservable from "./GenericDimensionObservable";
import GenericMeasureObservable from "./GenericMeasureObservable";
import GenericObjectObservable from "./GenericObjectObservable";
import GenericVariableObservable from "./GenericVariableObservable";
import VariableObservable from "./VariableObservable";

class AppObservable extends QixObservable {

    constructor(source) {
        super();
        this.source = source;
    }

    lift(operator) {
        const operatorName = operator.constructor.name;
        const operatorCheck = operatorName.slice(0,1).toLowerCase() + operatorName.slice(1,operatorName.indexOf("Operator"));

        // If operator is on list, lift it. otherwise, return basic observable
        const observable = nonLiftedOperators.indexOf(operatorCheck) < 0 ? new AppObservable() : new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }
    
}

// Add in QIX operators for Docs
extendPrototype(AppObservable,"Doc");

// Override certain properties to return qix observable subclasses
const outputs = outputTypes.Doc;
const qObs = {
    FieldObservable,
    GenericBookmarkObservable,
    GenericDimensionObservable,
    GenericMeasureObservable,
    GenericObjectObservable,
    GenericVariableObservable,
    VariableObservable
};

outputs.forEach(e=>{
    const methodName = e.method;
    const methodNameOrig = methodName.slice(0,1).toUpperCase() + methodName.slice(1);
    const obsClass = qObs[e.obsType];
    AppObservable.prototype[methodName] = function(...args) {
        return this
            .mergeMap(e=>e[methodNameOrig](...args))
            .let(o=>new obsClass(o));
    };
});


export default AppObservable;