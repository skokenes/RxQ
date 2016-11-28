import QixClass from "./qix-class";

export default class QixField extends QixClass {
    constructor(session,handle,source,response) {
        super("Field",session,handle,source,response);

        // Validation function 
        this.properties$ = this.invalidated$
            .mergeMap(f=>f.GetNxProperties());
    }
}