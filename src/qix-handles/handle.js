import { Observable } from "rxjs";

export default class Handle {
    constructor(session, handle) {

        // Reference to the websocket session
        this.session = session;
        
        // Reference to the observable of the handle for the current instance
        this.handle = handle;

        this.invalidated$ = session.changes
            .filter(f=> f.indexOf(handle) > -1)
            .mapTo(this)
            .startWith(this);

    }
};

Handle.prototype.askCold = function(method,...args) {
    // defer until subscription
    return Observable.defer(()=>this.session.ask({
        handle: this.handle,
        method: method.n,
        params: args
    }))
    .map(resp=>{
        const returnValue = method.o.length > 0 ? resp[method.o] : resp;
        if(!returnValue.hasOwnProperty("qReturn")) return returnValue;
        else if(typeof returnValue.qReturn.qType === "undefined") return returnValue.qReturn;
        else {
            let qClass = undefined;
            switch(returnValue.qReturn.qType) {
                case "Global":
                    qClass = require("./global");
                    break;
                case "Doc":
                    qClass = require("./app");
                    break;
                case "Field":
                    qClass = require("./field");
                    break;
                case "GenericBookmark":
                    qClass = require("./generic-bookmark");
                    break;
                case "GenericDimension":
                    qClass = require("./generic-dimension");
                    break;
                case "GenericMeasure":
                    qClass = require("./generic-measure");
                    break;
                case "GenericObject":
                    qClass = require("./generic-object");
                    break;
                case "GenericVariable":
                    qClass = require("./generic-variable");
                    break;
                case "Variable":
                    qClass = require("./variable");
                    break;
            }
            return new qClass(this.session,returnValue.qReturn.qHandle);
        }
    });
}