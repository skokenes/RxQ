import engineWrapper from "./engine-wrapper";
import * as Rx from "rxjs"; 

export default class QixClass {
    constructor(type,session,handle) {
        const methods = engineWrapper[type];
        const methodNames = Object.keys(methods);

        this.handle = handle;
        this.session = session;
        this.type = type;

        const wsOpen = session.obs.wsOpen;
        const wsPassed = session.obs.wsPassed;
        const seqGen = session.seqGen;

        methodNames.forEach(e => {
            const method = methods[e];

            this[e] = (...args) => {
                const id$ = seqGen.take(1);
                return wsPassed   
                    .withLatestFrom(wsOpen,(pass,ws)=>ws)
                    .combineLatest(id$)
                    .mergeMap(([ws,id])=>{
                        return method(ws,handle,id,...args)
                    })
                    .map(d=>
                        d.hasOwnProperty("qReturn") && d.qReturn.hasOwnProperty("qType")
                        ? new QixClass(d.qReturn.qType,session,d.result.qReturn.qHandle)
                        : d
                    );
            };
        });
    }
}