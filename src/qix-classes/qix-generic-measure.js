import QixClass from "./qix-class";

export default class QixGenericMeasure extends QixClass {
    constructor(session,handle,source,response) {
        super("GenericMeasure",session,handle,source,response);

        // Validation function 
        this.layout$ = this.invalidated$
            .mergeMap(gm=>gm.GetLayout());
    }
}