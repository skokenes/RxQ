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
            .startWith(this)
            /*
                debounceTime added as temp patch for issue with how QIX engine treats `getObject` vs. `createSessionObject`.
                On `getObject`, no initial change event is provided, so we have to use a startWith to initialize an invalidation event.
                On `createSessionObject`, an initial change event is provided. The `startWith` call will then trigger 2 invalidation events.
                The debounceTime(0) removes this double call that happens for session objects. Would prefer that Qlik update engine so that
                both methods behave the same way.
            */
            .debounceTime(0);

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
       
        var hasQReturn = resp.hasOwnProperty("qReturn");
        var hasQType = hasQReturn ? (resp.qReturn.hasOwnProperty("qType")) : false; 

        if(hasQType) {
            let qClass = undefined;
            switch(resp.qReturn.qType) {
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
            return new qClass(this.session,resp.qReturn.qHandle);
        }
        else if(method.o.length > 0) {
            return resp[method.o];
        }
        else if(hasQReturn) return resp.qReturn;
        else return resp;
    });
}