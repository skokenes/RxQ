import QixClass from "./qix-class";

export default class QixApp extends QixClass {
    constructor(session,handle,source,response) {
        super("Doc",session,handle,source,response);

        // Validation function 
        this.layout$ = this.invalidated$
            .mergeMap(a=>a.GetAppLayout());
    }
}