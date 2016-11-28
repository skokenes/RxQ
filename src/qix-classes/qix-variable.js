import QixClass from "./qix-class";

export default class QixVariable extends QixClass {
    constructor(session,handle,source,response) {
        super("Variable",session,handle,source,response);

        // Validation function 
        this.layout$ = this.invalidated$
            .mergeMap(v=>v.GetNxProperties());
    }
}