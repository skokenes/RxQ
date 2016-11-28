import engineWrapper from "../engine-wrapper";

export default class QixClass {
    constructor(type,session,handle,source,response) {
        this.handle = handle;
        this.session = session;
        this.type = type;
        this.source = source;
        this.response = response;

        const methods = engineWrapper[this.type];
        const methodNames = Object.keys(methods);

        const wsOpen = session.obs.wsOpen;
        const wsPassed = session.obs.wsPassed;
        const wsTrafficIn = session.obs.wsTrafficIn;
        const seqGen = session.seqGen;

        this.invalidated$ = wsTrafficIn
            .filter(f=> f.hasOwnProperty("change") && f.change.indexOf(handle) > -1)
            .mapTo(this)
            .startWith(this);
        
        methodNames.forEach(e => {
            const method = methods[e];

            this[e] = (...args) => {
                const id$ = seqGen.take(1);
                return wsPassed   
                    .withLatestFrom(wsOpen,(pass,ws)=>ws)
                    .combineLatest(id$)
                    .mergeMap(([ws,id])=>{
                        return method(ws,this.handle,id,...args)
                    })
                    .map(d=>{
                        if(d.hasOwnProperty("qReturn") && d.qReturn.hasOwnProperty("qType")) {
                            let qClass = undefined;
                            switch(d.qReturn.qType) {
                                case "Global":
                                    qClass = require("./qix-global");
                                    break;
                                case "Doc":
                                    qClass = require("./qix-app");
                                    break;
                                case "Field":
                                    qClass = require("./qix-field");
                                    break;
                                case "GenericBookmark":
                                    qClass = require("./qix-generic-bookmark");
                                    break;
                                case "GenericDimension":
                                    qClass = require("./qix-generic-dimension");
                                    break;
                                case "GenericMeasure":
                                    qClass = require("./qix-generic-measure");
                                    break;
                                case "GenericObject":
                                    qClass = require("./qix-generic-object");
                                    break;
                                case "GenericVariable":
                                    qClass = require("./qix-generic-variable");
                                    break;
                                case "Variable":
                                    qClass = require("./qix-variable");
                                    break;
                            }
                            return new qClass(session,d.qReturn.qHandle,this,d);
                        }
                        else {
                            return { source: this, response: d };
                        }
                    });
            };
        });
    }
}