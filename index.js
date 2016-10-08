import EngineSession from "./src/engine-session";
import * as Rx from "rxjs"; 

const RxQ = {
    version: "0.0.1",
    connectEngine: function(config) {
        return new EngineSession(config)
    }
};

export default RxQ;