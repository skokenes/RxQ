import * as Rx from "rxjs";
//import Connection from "./connection";
import ManualConnection from "./manual-connection";
import QixClass from "./qix-class";

export default class EngineSession {
    constructor(config) {
        
        // Internals
        const handle = -1;
        const seqGen = seqId();

        //const wsTraffic = new Connection(config);
        const wsObs = new ManualConnection(config); 
        // -> named ManualConnection for now to distinguish from Connection where I tried to use OOB RxJS WebSocket functions but failed
        // -> should return an object with 3 observables that are useful for making API calls

        // Public
        this.obs = wsObs;
        this.seqGen = seqGen;    
        
        // Once passed authentication, return the engine session
        return wsObs.wsPassed
            .mapTo(this);
             
    }

    getGlobal() {
        return new QixClass("Global",this,-1);
    }
};

// Generator for sequence ids
function* seqId() {
    var index = 1;
    while(true) yield index++;
}