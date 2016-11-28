import QixClass from "./qix-class";

export default class QixGenericDimension extends QixClass {
    constructor(session,handle,source,response) {
        super("GenericDimension",session,handle,source,response);

        // Validation function 
        this.layout$ = this.invalidated$
            .mergeMap(gd=>gd.GetLayout());
    }
}