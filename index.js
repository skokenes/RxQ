import EngineSession from "./src/engine-session";
import engineWrapper from "./src/engine-wrapper";
import { Observable } from "rxjs";

const RxQ = {
    version: "0.1.0",
    $$: {
        engine: engineWrapper
    },
    connectEngine: function(config) {
        // Establish a session, then return a Qix Class type Global from it
        return new EngineSession(config)
            .map(m=>m.getGlobal());
    }
};

export default RxQ;