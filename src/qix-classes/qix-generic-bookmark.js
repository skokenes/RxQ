import QixClass from "./qix-class";

export default class QixGenericBookmark extends QixClass {
    constructor(session,handle,source,response) {
        super("GenericBookmark",session,handle,source,response);

        // Validation function 
        this.layout$ = this.invalidated$
            .mergeMap(gb=>gb.GetLayout());
    }
}