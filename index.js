import EngineSession from "./src/engine-session";
import engineWrapper from "./src/engine-wrapper";
import { Observable } from "rxjs";
import GlobalObservable from "./src/qObservables/GlobalObservable.js";

const RxQ = {
    version: "0.1.2",
    Observable: Observable,
    $$: {
        engine: engineWrapper
    },
    connectEngine: function(config) {
        // Establish a session, then return a Qix Class type Global from it
        return new EngineSession(config)
            .map(m=>m.getGlobal())
            .let(o=>new GlobalObservable(o));
    }
};

export default RxQ;