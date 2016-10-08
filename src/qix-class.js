import engineWrapper from "./engine-wrapper";
import * as Rx from "rxjs"; 

export default class QixClass {
    constructor(type,session,handle) {
        const methods = engineWrapper[type];
        const methodNames = Object.keys(methods);

        this.handle = handle;
        this.session = session;
        this.type = type;

        methodNames.forEach(e => {
            const method = methods[e];

            this[e] = (...args) => {
                const id = session.seqGen.next().value;
                return method(session,handle,id,...args)
                    .map(d=>
                        d.result.hasOwnProperty("qReturn") && d.result.qReturn.hasOwnProperty("qType")
                        ? new QixClass(d.result.qReturn.qType,session,d.result.qReturn.qHandle)
                        : d
                    );
            };
        });
    }
}