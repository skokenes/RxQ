import { Observable } from "rxjs";

class QixObservable extends Observable {

    constructor(source) {
        super();
        this.source = source;
    }

    lift(operator) {
        const observable = new QixObservable(); //<-- important part here
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