import QixClass from "./qix-class";

export default class QixGenericVariable extends QixClass {
    constructor(session,handle,source,response) {
        super("GenericVariable",session,handle,source,response);

        // Validation function 
        this.layout$ = this.invalidated$
            .mergeMap(gv=>gv.GetLayout());
    }
}