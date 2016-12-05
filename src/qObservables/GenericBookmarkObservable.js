import { Observable } from "rxjs";
import nonLiftedOperators from "./nonLiftedOperators";
import QixObservable from "./QixObservable";
import extendPrototype from "..//util/qix-extend-prototype";
import outputTypes from "../util/qix-obs-types";
import QixGenericBookmark from "../qix-classes/qix-generic-bookmark";

class GenericBookmarkObservable extends QixObservable {

    constructor(source) {
        super();
        if(typeof source != "undefined") {
            this.source = Observable.create(subscriber=>{
                source.subscribe(s=>{
                    if(s instanceof QixGenericBookmark) {
                        subscriber.next(s);
                    }
                    else {
                        subscriber.error(new Error("Data type mismatch: Emitted value is not an instance of QixGenericBookmark"));
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
        const observable = nonLiftedOperators.indexOf(operatorCheck) < 0 ? new GenericBookmarkObservable() : new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }

    qLayouts() {
        return this.mergeMap(q=>q.layout$);
    }

    qInvalidated() {
        return this
            .mergeMap(q=>q.invalidated$)
            .let(o=>new GenericBookmarkObservable(o));
    }

}

// Add in QIX operators
extendPrototype(GenericBookmarkObservable,"GenericBookmark");

// Override any properties that should return observable sub classes
const outputs = outputTypes.GenericBookmark;
const qObs = {
};

outputs.forEach(e=>{
    const methodName = "q" + e.method;
    const methodNameOrig = e.method;
    const obsClass = qObs[e.obsType];
    GenericBookmarkObservable.prototype[methodName] = function(...args) {
        return this
            .mergeMap(e=>e[methodNameOrig](...args))
            .let(o=>new obsClass(o));
    };
});


export default GenericBookmarkObservable;