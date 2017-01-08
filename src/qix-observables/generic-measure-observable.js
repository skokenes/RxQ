import QixObservable from "./qix-observable";
import addQixOperators from "../util/add-qix-operators";

class GenericMeasureObservable extends QixObservable {
    constructor(source, temp) {
        super(source,"generic-measure", temp);
    }

    // Layouts stream
    qLayouts() {
        const curClass = this.constructor;

        const resp = this
            .mergeMap(q=>q.layout$);
        
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
    }
}

// Add in QIX operators
addQixOperators(GenericMeasureObservable, "GenericMeasure");

export default GenericMeasureObservable;