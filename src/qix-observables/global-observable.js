import QixObservable from "./qix-observable";
import addQixOperators from "../util/add-qix-operators";

class GlobalObservable extends QixObservable {
    constructor(source, temp) {
        super(source,"global", temp);
    }
}

// Add in QIX operators
addQixOperators(GlobalObservable, "Global");

export default GlobalObservable;