import Connection from "./connection";
import QixClass from "./qix-class";
import { Observable } from "rxjs";

export default class EngineSession {
    constructor(config) {
        
        // Internals
        const handle = -1;
        const seqGen = Observable.from(seqId());

        //const wsTraffic = new Connection(config);
        const wsObs = new Connection(config); 
        // -> should return an object with 3 observables that are useful for making API calls

        // Public
        this.obs = wsObs;
        this.seqGen = seqGen;
        this.config = config;
        
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