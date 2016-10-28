import engineWrapper from "./engine-wrapper";

export default class QixClass {
    constructor(type,session,handle) {
        const methods = engineWrapper[type];
        const methodNames = Object.keys(methods);

        this.handle = handle;
        this.session = session;
        this.type = type;

        const wsOpen = session.obs.wsOpen;
        const wsPassed = session.obs.wsPassed;
        const wsTrafficIn = session.obs.wsTrafficIn;
        const seqGen = session.seqGen;

        this.invalidated$ = wsTrafficIn
            .filter(f=> f.hasOwnProperty("change") && f.change.indexOf(handle) > -1)
            .mapTo(this)
            .startWith(this);
        
        const validationFns = [
            {
                type: "Doc",
                fn: "GetAppLayout"
            },
            {
                type: "Field",
                fn: "GetNxProperties"
            },
            {
                type: "GenericBookmark",
                fn: "GetLayout"
            },
            {
                type: "GenericDimension",
                fn: "GetLayout"
            },
            {
                type: "GenericObject",
                fn: "GetLayout"
            },
            {
                type: "GenericMeasure",
                fn: "GetLayout"
            },
            {
                type: "GenericVariable",
                fn: "GetLayout"
            },
            {
                type: "Variable",
                fn: "GetNxProperties"
            }
        ];

        const validationIndex = validationFns
            .map(m=>m.type)
            .indexOf(type);

        if(validationIndex > -1) {
            this.layout$ = this.invalidated$
                .mergeMap(o=>o[validationFns[validationIndex].fn]());
        }


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
                        ? new QixClass(d.qReturn.qType,session,d.qReturn.qHandle)
                        : d
                    );
            };
        });
    }
}