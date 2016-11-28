import QixClass from "./qix-class";

export default class QixGenericObject extends QixClass {
    constructor(session,handle,source,response) {
        super("GenericObject",session,handle,source,response);

        // Validation function 
        this.layout$ = this.invalidated$
            .mergeMap(go=>go.GetLayout());
    }
}