import QixObservable from "./qix-observable";
import addQixOperators from "../util/add-qix-operators";
import setObsTemp from "../util/set-obs-temp";

class AppObservable extends QixObservable {
    constructor(source, temp) {
        super(source,"app", temp);
    }

    // App Layouts stream
    qAppLayouts() {
        const curClass = this.constructor;

        const resp = this
            .mergeMap(q=>q.layout$);

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

// Add in QIX operators
addQixOperators(AppObservable, "Doc");

export default AppObservable;