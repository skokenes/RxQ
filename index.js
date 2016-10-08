import EngineSession from "./src/engine-session";
import Connection from "./src/connection";
import * as Rx from "rxjs"; 

const RxQ = {
    version: "0.0.1",
    connectEngine: function(config) {
        return new EngineSession(config)
    },
    connectWs: function(config) {
        return new Connection(config)
    }
};

export default RxQ;